import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('~/server/services/redis', () => ({
  getRedisClient: vi.fn(),
}));

vi.mock('~/server/services/adminImageGuardrails', () => ({
  adminImageGuardrails: {
    dailyLimit: 100,
    rateLimitPerMinute: 2,
    maintenanceMode: false,
  },
}));

import { getRedisClient } from '~/server/services/redis';
import { checkAdminImageRateLimit } from './adminImageRateLimit';

type MockRedis = {
  incr: ReturnType<typeof vi.fn>;
  expire: ReturnType<typeof vi.fn>;
  ttl: ReturnType<typeof vi.fn>;
};

describe('adminImageRateLimit', () => {
  const mockedGetRedisClient = vi.mocked(getRedisClient);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('blocks when rate limit is exceeded', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-06T12:00:00Z'));

    const redis: MockRedis = {
      incr: vi.fn().mockResolvedValue(3),
      expire: vi.fn(),
      ttl: vi.fn().mockResolvedValue(30),
    };

    mockedGetRedisClient.mockResolvedValue(redis as unknown as Awaited<ReturnType<typeof getRedisClient>>);

    const result = await checkAdminImageRateLimit({ userId: 'admin-user', clientIp: '127.0.0.1' });

    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
    expect(redis.incr).toHaveBeenCalledWith('admin-image:rate:admin-user:127.0.0.1');
  });
});
