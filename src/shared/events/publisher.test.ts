import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { EventType, publishEvent, setSqsClientForTesting } from './publisher.js';

const FAMILY_ID = 'family-123';

describe('publishEvent', () => {
  let sendMock: ReturnType<typeof vi.fn>;
  let mockSqsClient: SQSClient;

  beforeEach(() => {
    sendMock = vi.fn().mockResolvedValue({});
    mockSqsClient = { send: sendMock } as unknown as SQSClient;
    setSqsClientForTesting(mockSqsClient);
    process.env['SQS_QUEUE_URL'] = 'https://sqs.eu-west-1.amazonaws.com/123/weave-jobs';
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env['SQS_QUEUE_URL'];
    // Restore test env so other tests stay in fast-path
    process.env['NODE_ENV'] = 'test';
  });

  it('is a no-op in test environment', async () => {
    process.env['NODE_ENV'] = 'test';
    await publishEvent(EventType.GOAL_UPDATED, { familyId: FAMILY_ID, goalId: 'g-1' }, FAMILY_ID);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it('sends a SendMessageCommand when NODE_ENV is not test', async () => {
    process.env['NODE_ENV'] = 'development';
    await publishEvent(EventType.GOAL_UPDATED, { familyId: FAMILY_ID, goalId: 'g-1' }, FAMILY_ID);
    expect(sendMock).toHaveBeenCalledOnce();
    expect(sendMock.mock.calls[0]?.[0]).toBeInstanceOf(SendMessageCommand);
  });

  it('message body contains the correct type and payload', async () => {
    process.env['NODE_ENV'] = 'development';
    const payload = { familyId: FAMILY_ID, goalId: 'g-1' };
    await publishEvent(EventType.GOAL_UPDATED, payload, FAMILY_ID);

    const command = sendMock.mock.calls[0]?.[0] as SendMessageCommand;
    const body = JSON.parse(command.input.MessageBody ?? '{}') as {
      type: string;
      payload: unknown;
      publishedAt: string;
    };

    expect(body.type).toBe(EventType.GOAL_UPDATED);
    expect(body.payload).toEqual(payload);
    expect(typeof body.publishedAt).toBe('string');
  });

  it('sets MessageGroupId to familyId for FIFO ordering', async () => {
    process.env['NODE_ENV'] = 'development';
    await publishEvent(EventType.EXPENSE_UPDATED, { familyId: FAMILY_ID, expenseId: 'e-1' }, FAMILY_ID);

    const command = sendMock.mock.calls[0]?.[0] as SendMessageCommand;
    expect(command.input.MessageGroupId).toBe(FAMILY_ID);
  });

  it('sets QueueUrl from SQS_QUEUE_URL env var', async () => {
    process.env['NODE_ENV'] = 'development';
    await publishEvent(EventType.CALENDAR_SYNCED, { familyId: FAMILY_ID }, FAMILY_ID);

    const command = sendMock.mock.calls[0]?.[0] as SendMessageCommand;
    expect(command.input.QueueUrl).toBe('https://sqs.eu-west-1.amazonaws.com/123/weave-jobs');
  });

  it('throws when SQS_QUEUE_URL is missing outside test', async () => {
    process.env['NODE_ENV'] = 'development';
    delete process.env['SQS_QUEUE_URL'];
    await expect(
      publishEvent(EventType.CALENDAR_SYNCED, { familyId: FAMILY_ID }, FAMILY_ID),
    ).rejects.toThrow('SQS_QUEUE_URL is not set');
  });

  it('EventType values are correct strings', () => {
    expect(EventType.CALENDAR_SYNC_REQUESTED).toBe('CALENDAR_SYNC_REQUESTED');
    expect(EventType.CALENDAR_SYNCED).toBe('CALENDAR_SYNCED');
    expect(EventType.GOAL_UPDATED).toBe('GOAL_UPDATED');
    expect(EventType.EXPENSE_UPDATED).toBe('EXPENSE_UPDATED');
    expect(EventType.WEEKLY_DIGEST_REQUESTED).toBe('WEEKLY_DIGEST_REQUESTED');
    expect(EventType.TAX_PROFILE_UPDATED).toBe('TAX_PROFILE_UPDATED');
  });
});
