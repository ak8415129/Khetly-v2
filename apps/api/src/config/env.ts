import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // Our own JWT — issued after verifying Google login, used for all API calls
  JWT_SECRET: z.string().min(1).default('khetly-dev-secret-minimum-32-chars-long'),
  JWT_REFRESH_SECRET: z.string().min(1).default('khetly-refresh-secret-min-32-chars-long'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('90d'),

  // Firebase Admin SDK — for verifying Google Sign-In tokens
  FIREBASE_PROJECT_ID: z.string().min(1, 'FIREBASE_PROJECT_ID is required'),
  FIREBASE_CLIENT_EMAIL: z.string().min(1, 'FIREBASE_CLIENT_EMAIL is required'),
  FIREBASE_PRIVATE_KEY: z.string().min(1, 'FIREBASE_PRIVATE_KEY is required'),

  UPLOAD_DIR: z.string().default('./uploads'),
  MAX_FILE_SIZE_MB: z.coerce.number().default(10),

  ANTHROPIC_API_KEY: z.string().optional(),
  FRONTEND_URL: z.string().default('http://localhost:3000'),

  // First admin account — auto-promoted on first login (setup convenience)
  FIRST_ADMIN_EMAIL: z.string().optional(),
})

function parseEnv() {
  const result = envSchema.safeParse(process.env)
  if (!result.success) {
    console.error('❌ Invalid environment variables:')
    result.error.issues.forEach((issue) => {
      console.error(`   ${issue.path.join('.')}: ${issue.message}`)
    })
    process.exit(1)
  }
  return result.data
}

export const env = parseEnv()
export type Env = typeof env
