import { z } from 'zod'

// APP_SECRET must be 64 hex chars (openssl rand -hex 32 = 32 bytes = 64 hex chars).
// Validated here so the server never starts with a weak or missing secret.
const hexString64 = z
  .string()
  .regex(
    /^[0-9a-fA-F]{64}$/,
    'APP_SECRET must be 64 hex characters (openssl rand -hex 32)',
  )

const ConfigSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  // RS256 private key — signs access tokens
  JWT_SECRET: z.string().min(1, 'JWT_SECRET (RS256 private key) is required'),
  // RS256 public key — verifies access tokens
  JWT_PUBLIC_KEY: z.string().min(1, 'JWT_PUBLIC_KEY (RS256 public key) is required'),
  // AES-256 key for encrypting Google OAuth refresh tokens on User.googleRefreshTokenEnc
  APP_SECRET: hexString64,
  REDIS_URL: z.string().min(1, 'REDIS_URL is required'),
  AWS_REGION: z.string().default('eu-central-1'),
  SQS_CALENDAR_SYNC_QUEUE_URL: z
    .string()
    .url('SQS_CALENDAR_SYNC_QUEUE_URL must be a valid URL'),
  SQS_INSIGHT_RECALC_QUEUE_URL: z
    .string()
    .url('SQS_INSIGHT_RECALC_QUEUE_URL must be a valid URL'),
  SQS_WEEKLY_DIGEST_QUEUE_URL: z
    .string()
    .url('SQS_WEEKLY_DIGEST_QUEUE_URL must be a valid URL'),
  SQS_TAX_DEADLINE_QUEUE_URL: z
    .string()
    .url('SQS_TAX_DEADLINE_QUEUE_URL must be a valid URL'),
  SES_FROM_EMAIL: z.string().email('SES_FROM_EMAIL must be a valid email address'),
  GOOGLE_CLIENT_ID: z.string().min(1, 'GOOGLE_CLIENT_ID is required'),
  GOOGLE_CLIENT_SECRET: z.string().min(1, 'GOOGLE_CLIENT_SECRET is required'),
  GOOGLE_REDIRECT_URI: z.string().url('GOOGLE_REDIRECT_URI must be a valid URL'),
  // Comma-separated list of allowed CORS origins (e.g. http://localhost:3000)
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3001),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
})

export type Config = z.infer<typeof ConfigSchema>

const result = ConfigSchema.safeParse(process.env)

if (!result.success) {
  const fields = result.error.flatten().fieldErrors
  const lines = Object.entries(fields)
    .map(([key, messages]) => `  ${key}: ${(messages ?? []).join(', ')}`)
    .join('\n')
  console.error(`\n❌  Invalid environment variables — server cannot start:\n${lines}\n`)
  process.exit(1)
}

export const config: Config = result.data
