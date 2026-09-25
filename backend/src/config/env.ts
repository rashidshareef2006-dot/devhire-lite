import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000'),

  // Database
  DATABASE_URL: z.string(),
  DATABASE_URL_UNPOOLED: z.string().optional(),

  // JWT
  JWT_ACCESS_SECRET: z.string().min(10),
  JWT_REFRESH_SECRET: z.string().min(10),
  JWT_ACCESS_EXPIRES: z.string().default('15m'),
  JWT_REFRESH_EXPIRES: z.string().default('7d'),

  // Admin
  ADMIN_USERNAME: z.string().min(3),
  ADMIN_PASSWORD: z.string().min(4),
  ADMIN_JWT_SECRET: z.string().min(20),

  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  CLIENT_URL: z.string().default('http://localhost:5173'),

  // Email
  EMAIL_USER: z.string().email(),
  EMAIL_APP_PASSWORD: z.string().min(8),
  EMAIL_FROM_NAME: z.string().default('DevHire Lite'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;