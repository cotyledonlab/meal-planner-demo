/* eslint-disable no-console */

export function createLogger(scope: string) {
  return {
    info: (message: string, meta: Record<string, unknown> = {}) => {
      console.info(`[${scope}] ${message}`, meta);
    },
    error: (message: string, meta: Record<string, unknown> = {}) => {
      console.error(`[${scope}] ${message}`, meta);
    }
  };
}
