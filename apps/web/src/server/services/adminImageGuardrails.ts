import { env } from '~/env';

export const adminImageGuardrails = {
  dailyLimit: env.ADMIN_IMAGE_DAILY_LIMIT,
  rateLimitPerMinute: env.ADMIN_IMAGE_RATE_LIMIT_PER_MINUTE,
  maintenanceMode: env.ADMIN_IMAGE_MAINTENANCE_MODE === 'true',
};
