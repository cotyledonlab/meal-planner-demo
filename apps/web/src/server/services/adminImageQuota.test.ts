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
  eval: ReturnType<typeof vi.fn>;
};

describe('adminImageQuota', () => {
  const mockedGetRedisClient = vi.mocked(getRedisClient);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('allows when quota is available', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-06T12:00:00Z'));

    const redis: MockRedis = {
      get: vi.fn().mockResolvedValue('0'),
      eval: vi.fn(),
    };

    mockedGetRedisClient.mockResolvedValue(
      redis as unknown as Awaited<ReturnType<typeof getRedisClient>>
    );

    const result = await checkAdminImageDailyQuota({ userId: 'admin-user' });

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
    expect(result.used).toBe(0);
    expect(result.isFallback).toBe(false);
  });

  it('blocks when daily usage meets the limit', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-06T12:00:00Z'));

    const redis: MockRedis = {
      get: vi.fn().mockResolvedValue('2'),
      eval: vi.fn(),
    };

    mockedGetRedisClient.mockResolvedValue(
      redis as unknown as Awaited<ReturnType<typeof getRedisClient>>
    );

    const result = await checkAdminImageDailyQuota({ userId: 'admin-user' });

    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
    expect(redis.get).toHaveBeenCalledWith('admin-image:quota:admin-user:2026-01-06');
  });

  it('falls back when Redis is unavailable', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-06T12:00:00Z'));

    mockedGetRedisClient.mockResolvedValue(null);

    const result = await checkAdminImageDailyQuota({ userId: 'admin-user' });

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
    expect(result.isFallback).toBe(true);
  });

  it('falls back when Redis operation fails', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-06T12:00:00Z'));

    const redis: MockRedis = {
      get: vi.fn().mockRejectedValue(new Error('Redis error')),
      eval: vi.fn(),
    };

    mockedGetRedisClient.mockResolvedValue(
      redis as unknown as Awaited<ReturnType<typeof getRedisClient>>
    );

    const result = await checkAdminImageDailyQuota({ userId: 'admin-user' });

    expect(result.allowed).toBe(true);
    expect(result.isFallback).toBe(true);
  });

  it('increments usage using atomic Lua script', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-06T08:00:00Z'));

    const redis: MockRedis = {
      get: vi.fn(),
      eval: vi.fn().mockResolvedValue(1),
    };

    mockedGetRedisClient.mockResolvedValue(
      redis as unknown as Awaited<ReturnType<typeof getRedisClient>>
    );

    await incrementAdminImageDailyUsage({ userId: 'admin-user' });

    expect(redis.eval).toHaveBeenCalledWith(
      expect.stringContaining('INCR'),
      expect.objectContaining({
        keys: ['admin-image:quota:admin-user:2026-01-06'],
      })
    );
  });

  it('does nothing when Redis is unavailable during increment', async () => {
    mockedGetRedisClient.mockResolvedValue(null);

    // Should not throw
    await expect(incrementAdminImageDailyUsage({ userId: 'admin-user' })).resolves.toBeUndefined();
  });

  it('calculates correct reset time at UTC midnight', async () => {
    vi.useFakeTimers();
    // Set time to 23:30 UTC - reset should be in 30 minutes
    vi.setSystemTime(new Date('2026-01-06T23:30:00Z'));

    const redis: MockRedis = {
      get: vi.fn().mockResolvedValue('0'),
      eval: vi.fn(),
    };

    mockedGetRedisClient.mockResolvedValue(
      redis as unknown as Awaited<ReturnType<typeof getRedisClient>>
    );

    const result = await checkAdminImageDailyQuota({ userId: 'admin-user' });

    // Reset should be at midnight UTC the next day
    expect(result.resetAt.toISOString()).toBe('2026-01-07T00:00:00.000Z');
  });
});
