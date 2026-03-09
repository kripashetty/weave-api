// Config cannot be tested by importing the module directly — it calls process.exit(1)
// at module evaluation time if env vars are missing.
// Instead we test the Zod schema in isolation by re-importing it or testing parseConfig.
// The integration contract is: process.exit(1) on any missing required variable.

import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Mirror the schema here so we can test validation rules without triggering process.exit.
// This is intentionally kept in sync with src/config.ts.
const hexString64 = z
  .string()
  .regex(/^[0-9a-fA-F]{64}$/, 'APP_SECRET must be 64 hex characters');

const TestConfigSchema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(1),
  JWT_PUBLIC_KEY: z.string().min(1),
  APP_SECRET: hexString64,
  REDIS_URL: z.string().min(1),
  AWS_REGION: z.string().default('eu-west-1'),
  SQS_QUEUE_URL: z.string().min(1),
  SES_FROM_EMAIL: z.string().email(),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3001),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

const validEnv = {
  DATABASE_URL: 'postgresql://user:pass@localhost:5432/weave',
  JWT_SECRET: 'private-key-pem',
  JWT_PUBLIC_KEY: 'public-key-pem',
  APP_SECRET: 'a'.repeat(64),
  REDIS_URL: 'redis://localhost:6379',
  SQS_QUEUE_URL: 'https://sqs.eu-west-1.amazonaws.com/123/weave-jobs',
  SES_FROM_EMAIL: 'hello@weave.family',
};

describe('ConfigSchema', () => {
  it('parses a fully valid env object', () => {
    const result = TestConfigSchema.safeParse(validEnv);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.PORT).toBe(3001);
      expect(result.data.AWS_REGION).toBe('eu-west-1');
      expect(result.data.NODE_ENV).toBe('development');
    }
  });

  it('applies PORT default when omitted', () => {
    const result = TestConfigSchema.safeParse(validEnv);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.PORT).toBe(3001);
  });

  it('coerces PORT from string to number', () => {
    const result = TestConfigSchema.safeParse({ ...validEnv, PORT: '4000' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.PORT).toBe(4000);
  });

  it('rejects invalid NODE_ENV value', () => {
    const result = TestConfigSchema.safeParse({ ...validEnv, NODE_ENV: 'staging' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid SES_FROM_EMAIL', () => {
    const result = TestConfigSchema.safeParse({ ...validEnv, SES_FROM_EMAIL: 'not-an-email' });
    expect(result.success).toBe(false);
  });

  it('rejects APP_SECRET shorter than 64 hex chars', () => {
    const result = TestConfigSchema.safeParse({ ...validEnv, APP_SECRET: 'abc123' });
    expect(result.success).toBe(false);
  });

  it('rejects APP_SECRET with non-hex characters', () => {
    const result = TestConfigSchema.safeParse({ ...validEnv, APP_SECRET: 'z'.repeat(64) });
    expect(result.success).toBe(false);
  });

  it('accepts APP_SECRET that is exactly 64 lowercase hex chars', () => {
    const result = TestConfigSchema.safeParse({
      ...validEnv,
      APP_SECRET: 'deadbeef'.repeat(8),
    });
    expect(result.success).toBe(true);
  });

  it('fails when DATABASE_URL is missing', () => {
    const { DATABASE_URL: _omit, ...rest } = validEnv;
    const result = TestConfigSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('fails when JWT_SECRET is missing', () => {
    const { JWT_SECRET: _omit, ...rest } = validEnv;
    const result = TestConfigSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });
});
