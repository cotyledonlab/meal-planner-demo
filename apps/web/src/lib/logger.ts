import pino from 'pino';

/**
 * Logger configuration for the application.
 *
 * In development:
 * - Uses pino-pretty for human-readable output
 * - Logs to stdout with colorized output
 *
 * In production:
 * - Uses JSON output for structured logging
 * - Writes to stderr (prevents HTTP response corruption)
 * - Sets appropriate log level
 */
export const logger = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',

  // In production, write to stderr to avoid corrupting HTTP responses
  browser: {
    asObject: true,
  },

  ...(process.env.NODE_ENV !== 'production' && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss',
        ignore: 'pid,hostname',
      },
    },
  }),

  // Always write to stderr in production
  ...(process.env.NODE_ENV === 'production' && {
    destination: 2, // stderr
  }),
});

/**
 * Create a child logger with a specific name/context
 *
 * @example
 * const log = createLogger('trpc');
 * log.info({ path: 'plan.generate', duration: 123 }, 'Request completed');
 */
export function createLogger(name: string) {
  return logger.child({ name });
}
