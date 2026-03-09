import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

// All event types that can be published. Each one maps to a specific SQS consumer.
// Adding a new event: add the type here, add the corresponding payload type below,
// add the consumer handler in src/shared/jobs/.
export const EventType = {
  CALENDAR_SYNC_REQUESTED: 'CALENDAR_SYNC_REQUESTED',
  CALENDAR_SYNCED: 'CALENDAR_SYNCED',
  GOAL_UPDATED: 'GOAL_UPDATED',
  EXPENSE_UPDATED: 'EXPENSE_UPDATED',
  WEEKLY_DIGEST_REQUESTED: 'WEEKLY_DIGEST_REQUESTED',
  TAX_PROFILE_UPDATED: 'TAX_PROFILE_UPDATED',
} as const;

export type EventType = (typeof EventType)[keyof typeof EventType];

// Typed payload per event — prevents publishing incomplete messages.
interface EventPayloads {
  CALENDAR_SYNC_REQUESTED: { familyId: string };
  CALENDAR_SYNCED: { familyId: string };
  GOAL_UPDATED: { familyId: string; goalId: string };
  EXPENSE_UPDATED: { familyId: string; expenseId: string };
  WEEKLY_DIGEST_REQUESTED: { familyId: string };
  TAX_PROFILE_UPDATED: { familyId: string; taxProfileId: string };
}

export interface WeaveEvent<T extends EventType = EventType> {
  type: T;
  payload: EventPayloads[T];
  publishedAt: string;
}

// Lazily initialised — avoids requiring AWS credentials at module load time,
// which would break unit tests that don't touch SQS.
let sqsClient: SQSClient | null = null;

function getSqsClient(): SQSClient {
  if (!sqsClient) {
    sqsClient = new SQSClient({ region: process.env['AWS_REGION'] ?? 'eu-west-1' });
  }
  return sqsClient;
}

// MessageGroupId = familyId ensures all events for a family are processed in order
// when using a FIFO queue. Ordering within a family prevents a stale CALENDAR_SYNCED
// from running insight recalc before the expense write it depends on.
export async function publishEvent<T extends EventType>(
  type: T,
  payload: EventPayloads[T],
  familyId: string,
): Promise<void> {
  // Skip real SQS in test to keep unit tests fast and free of AWS credentials
  if (process.env['NODE_ENV'] === 'test') {
    return;
  }

  const queueUrl = process.env['SQS_QUEUE_URL'];
  if (!queueUrl) {
    throw new Error('SQS_QUEUE_URL is not set — cannot publish event');
  }

  const event: WeaveEvent<T> = { type, payload, publishedAt: new Date().toISOString() };

  await getSqsClient().send(
    new SendMessageCommand({
      QueueUrl: queueUrl,
      MessageBody: JSON.stringify(event),
      // FIFO queue: all events for the same family arrive in publish order
      MessageGroupId: familyId,
      // Deduplication key: type + familyId + second-level timestamp.
      // Prevents duplicate messages if the publisher retries within the 5-minute dedup window.
      MessageDeduplicationId: `${type}-${familyId}-${Math.floor(Date.now() / 1000)}`,
    }),
  );
}

// Exported for dependency injection in tests — replace the SQS client with a mock.
export function setSqsClientForTesting(client: SQSClient): void {
  sqsClient = client;
}
