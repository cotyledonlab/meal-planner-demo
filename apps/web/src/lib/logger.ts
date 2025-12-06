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
const isProd = process.env.NODE_ENV === 'production';

type DevLogger = {
  info: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  debug: (...args: unknown[]) => void;
  child: () => DevLogger;
};

const devLogger: DevLogger = {
  info: (...args) => console.log('[info]', ...args),
  error: (...args) => console.error('[error]', ...args),
  warn: (...args) => console.warn('[warn]', ...args),
  debug: (...args) => console.debug('[debug]', ...args),
  child: () => devLogger,
};

const prodLogger = pino({
  level: 'info',
  browser: {
    asObject: true,
  },
});

type LoggerInstance = typeof prodLogger | DevLogger;

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
