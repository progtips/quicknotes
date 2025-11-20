import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z
    .string()
    .default('4000')
    .transform(val => parseInt(val, 10))
    .pipe(z.number().int().min(1).max(65535)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().url('DATABASE_URL должен быть валидным URL'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET должен содержать минимум 32 символа'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN: z.string().default('*'),
});

type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  try {
    return envSchema.parse({
      PORT: process.env.PORT ?? undefined,
      NODE_ENV: process.env.NODE_ENV ?? undefined,
      DATABASE_URL: process.env.DATABASE_URL,
      JWT_SECRET: process.env.JWT_SECRET,
      JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? undefined,
      CORS_ORIGIN: process.env.CORS_ORIGIN ?? undefined,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('\n');
      throw new Error(`Ошибка валидации переменных окружения:\n${errorMessages}`);
    }
    throw error;
  }
}

export const env = validateEnv();
