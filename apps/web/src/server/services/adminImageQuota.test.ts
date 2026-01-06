import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('~/server/services/redis', () => ({
  getRedisClient: vi.fn(),
}));

vi.mock('~/server/services/adminImageGuardrails', () => ({
  adminImageGuardrails: {
    dailyLimit: 2,
    rateLimitPerMinute: 5,
    maintenanceMode: false,
  },
}));

import { getRedisClient } from '~/server/services/redis';
import { checkAdminImageDailyQuota, incrementAdminImageDailyUsage } from './adminImageQuota';

type MockRedis = {
  get: ReturnType<typeof vi.fn>;
  incr: ReturnType<typeof vi.fn>;
  expire: ReturnType<typeof vi.fn>;
};

describe('adminImageQuota', () => {
  const mockedGetRedisClient = vi.mocked(getRedisClient);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('blocks when daily usage meets the limit', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-06T12:00:00Z'));

    const redis: MockRedis = {
      get: vi.fn().mockResolvedValue('2'),
      incr: vi.fn(),
      expire: vi.fn(),
    };

    mockedGetRedisClient.mockResolvedValue(redis as unknown as Awaited<ReturnType<typeof getRedisClient>>);

    const result = await checkAdminImageDailyQuota({ userId: 'admin-user' });

    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
    expect(redis.get).toHaveBeenCalledWith('admin-image:quota:admin-user:2026-01-06');
  });

  it('increments usage and sets TTL on first use', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-06T08:00:00Z'));

    const redis: MockRedis = {
      get: vi.fn(),
      incr: vi.fn().mockResolvedValue(1),
      expire: vi.fn().mockResolvedValue(true),
    };

    mockedGetRedisClient.mockResolvedValue(redis as unknown as Awaited<ReturnType<typeof getRedisClient>>);

    await incrementAdminImageDailyUsage({ userId: 'admin-user' });

    expect(redis.incr).toHaveBeenCalledWith('admin-image:quota:admin-user:2026-01-06');
    expect(redis.expire).toHaveBeenCalledWith('admin-image:quota:admin-user:2026-01-06', expect.any(Number));
  });
});
