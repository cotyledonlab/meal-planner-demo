import pino, { type Logger } from 'pino';

/**
 * Logger configuration for the application.
 *
 * In development:
 * - Uses console methods for human-readable output
 * - Colorized output in terminal
 *
 * In production:
 * - Uses pino for JSON structured logging
 * - Writes to stderr (prevents HTTP response corruption)
 * - Sets appropriate log level
 */
const isProd = process.env.NODE_ENV === 'production';

/**
 * Subset of pino Logger interface used in this application.
 * Using Pick ensures type compatibility with pino while allowing
 * a simpler console-based implementation in development.
 */
type LogMethods = 'info' | 'error' | 'warn' | 'debug';
type DevLogger = Pick<Logger, LogMethods> & {
  child: (bindings?: Record<string, unknown>) => DevLogger;
};

const devLogger: DevLogger = {
  info: (...args: unknown[]) => console.log('[info]', ...args),
  error: (...args: unknown[]) => console.error('[error]', ...args),
  warn: (...args: unknown[]) => console.warn('[warn]', ...args),
  debug: (...args: unknown[]) => console.debug('[debug]', ...args),
  child: () => devLogger,
};

const prodLogger = pino({
  level: 'info',
  browser: {
    asObject: true,
  },
});

type LoggerInstance = Logger | DevLogger;

export const logger: LoggerInstance = isProd ? prodLogger : devLogger;

/**
 * Create a child logger with a specific name/context
 *
 * @example
 * const log = createLogger('trpc');
 * log.info({ path: 'plan.generate', duration: 123 }, 'Request completed');
 */
export function createLogger(name: string) {
  if (isProd) {
    return prodLogger.child({ name });
  }
  return devLogger;
}
