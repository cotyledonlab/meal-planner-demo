import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().url().optional(),
  REDIS_URL: z.string().optional()
});

export type Env = z.infer<typeof envSchema>;

export function parseEnv(input = process.env): Env {
  return envSchema.parse(input);
}
