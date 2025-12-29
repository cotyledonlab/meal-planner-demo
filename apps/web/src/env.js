import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    AUTH_SECRET: process.env.NODE_ENV === 'production' ? z.string() : z.string().optional(),
    AUTH_DISCORD_ID: z.string().optional(),
    AUTH_DISCORD_SECRET: z.string().optional(),
    DATABASE_URL: z
      .string()
      .refine(
        (url) => url.startsWith('postgresql://') || url.startsWith('postgres://'),
        'DATABASE_URL must be a valid PostgreSQL connection string'
      ),
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.string().regex(/^\d+$/, 'SMTP_PORT must be a valid integer').optional(),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
    SMTP_FROM: z.string().optional(),
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    // Gemini / Vertex AI configuration
    GEMINI_USE_VERTEX_AI: z.enum(['true', 'false']).optional().default('false'),
    GOOGLE_CLOUD_PROJECT: z.string().optional(),
    GOOGLE_CLOUD_LOCATION: z.string().optional().default('us-central1'),
    GEMINI_API_KEY: z.string().optional(),
    GEMINI_IMAGE_MODEL: z.string().optional().default('gemini-2.0-flash-exp'),
    GEMINI_IMAGE_FALLBACK_MODEL: z.string().optional().default('gemini-2.0-flash-exp'),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_BASE_PATH: z.string().optional(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    AUTH_SECRET: process.env.AUTH_SECRET,
    AUTH_DISCORD_ID: process.env.AUTH_DISCORD_ID,
    AUTH_DISCORD_SECRET: process.env.AUTH_DISCORD_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    SMTP_FROM: process.env.SMTP_FROM,
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_BASE_PATH: process.env.BASE_PATH,
    GEMINI_USE_VERTEX_AI: process.env.GEMINI_USE_VERTEX_AI,
    GOOGLE_CLOUD_PROJECT: process.env.GOOGLE_CLOUD_PROJECT,
    GOOGLE_CLOUD_LOCATION: process.env.GOOGLE_CLOUD_LOCATION,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    GEMINI_IMAGE_MODEL: process.env.GEMINI_IMAGE_MODEL,
    GEMINI_IMAGE_FALLBACK_MODEL: process.env.GEMINI_IMAGE_FALLBACK_MODEL,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});

// Validate that Discord auth credentials are provided together
if (
  !process.env.SKIP_ENV_VALIDATION &&
  ((env.AUTH_DISCORD_ID && !env.AUTH_DISCORD_SECRET) ||
    (!env.AUTH_DISCORD_ID && env.AUTH_DISCORD_SECRET))
) {
  throw new Error(
    'Invalid Discord auth configuration: set both AUTH_DISCORD_ID and AUTH_DISCORD_SECRET, or remove both.'
  );
}
