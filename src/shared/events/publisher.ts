import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs'

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
} as const

export type EventType = (typeof EventType)[keyof typeof EventType]

// Typed payload per event — prevents publishing incomplete messages.
interface EventPayloads {
  CALENDAR_SYNC_REQUESTED: { familyId: string }
  CALENDAR_SYNCED: { familyId: string }
  GOAL_UPDATED: { familyId: string; goalId: string }
  EXPENSE_UPDATED: { familyId: string; expenseId: string }
  WEEKLY_DIGEST_REQUESTED: { familyId: string }
  TAX_PROFILE_UPDATED: { familyId: string; taxProfileId: string }
}

export interface WeaveEvent<T extends EventType = EventType> {
  type: T
  payload: EventPayloads[T]
  publishedAt: string
}

// Maps each event type to its dedicated SQS queue URL env var.
const EVENT_QUEUE_MAP: Record<EventType, string> = {
  CALENDAR_SYNC_REQUESTED: 'SQS_CALENDAR_SYNC_QUEUE_URL',
  CALENDAR_SYNCED: 'SQS_INSIGHT_RECALC_QUEUE_URL',
  GOAL_UPDATED: 'SQS_INSIGHT_RECALC_QUEUE_URL',
  EXPENSE_UPDATED: 'SQS_INSIGHT_RECALC_QUEUE_URL',
  WEEKLY_DIGEST_REQUESTED: 'SQS_WEEKLY_DIGEST_QUEUE_URL',
  TAX_PROFILE_UPDATED: 'SQS_TAX_DEADLINE_QUEUE_URL',
}

// Lazily initialised — avoids requiring AWS credentials at module load time,
// which would break unit tests that don't touch SQS.
let sqsClient: SQSClient | null = null

function getSqsClient(): SQSClient {
  if (!sqsClient) {
    sqsClient = new SQSClient({ region: process.env['AWS_REGION'] ?? 'eu-central-1' })
  }
  return sqsClient
}

export async function publishEvent<T extends EventType>(
  type: T,
  payload: EventPayloads[T],
): Promise<void> {
  // Skip real SQS in test to keep unit tests fast and free of AWS credentials
  if (process.env['NODE_ENV'] === 'test') {
    return
  }

  const queueEnvVar = EVENT_QUEUE_MAP[type]
  const queueUrl = process.env[queueEnvVar]
  if (!queueUrl) {
    throw new Error(`${queueEnvVar} is not set — cannot publish event ${type}`)
  }

  const event: WeaveEvent<T> = { type, payload, publishedAt: new Date().toISOString() }

  await getSqsClient().send(
    new SendMessageCommand({
      QueueUrl: queueUrl,
      MessageBody: JSON.stringify(event),
    }),
  )
}

// Exported for dependency injection in tests — replace the SQS client with a mock.
export function setSqsClientForTesting(client: SQSClient): void {
  sqsClient = client
}
