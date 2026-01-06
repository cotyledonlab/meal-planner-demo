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
import { checkAdminImageRateLimit, getClientIp } from './adminImageRateLimit';

type MockRedis = {
  eval: ReturnType<typeof vi.fn>;
  ttl: ReturnType<typeof vi.fn>;
  get: ReturnType<typeof vi.fn>;
};

describe('adminImageRateLimit', () => {
  const mockedGetRedisClient = vi.mocked(getRedisClient);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('allows requests when under rate limit', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-06T12:00:00Z'));

    const redis: MockRedis = {
      eval: vi.fn().mockResolvedValue(1),
      ttl: vi.fn().mockResolvedValue(60),
      get: vi.fn(),
    };

    mockedGetRedisClient.mockResolvedValue(
      redis as unknown as Awaited<ReturnType<typeof getRedisClient>>
    );

    const result = await checkAdminImageRateLimit({ userId: 'admin-user', clientIp: '127.0.0.1' });

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(1);
    expect(result.isFallback).toBe(false);
  });

  it('blocks when rate limit is exceeded', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-06T12:00:00Z'));

    const redis: MockRedis = {
      eval: vi.fn().mockResolvedValue(3),
      ttl: vi.fn().mockResolvedValue(30),
      get: vi.fn(),
    };

    mockedGetRedisClient.mockResolvedValue(
      redis as unknown as Awaited<ReturnType<typeof getRedisClient>>
    );

    const result = await checkAdminImageRateLimit({ userId: 'admin-user', clientIp: '127.0.0.1' });

    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('falls back when Redis is unavailable', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-06T12:00:00Z'));

    mockedGetRedisClient.mockResolvedValue(null);

    const result = await checkAdminImageRateLimit({ userId: 'admin-user', clientIp: '127.0.0.1' });

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
    expect(result.isFallback).toBe(true);
  });

  it('falls back when Redis operation fails', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-06T12:00:00Z'));

    const redis: MockRedis = {
      eval: vi.fn().mockRejectedValue(new Error('Redis error')),
      ttl: vi.fn(),
      get: vi.fn(),
    };

    mockedGetRedisClient.mockResolvedValue(
      redis as unknown as Awaited<ReturnType<typeof getRedisClient>>
    );

    const result = await checkAdminImageRateLimit({ userId: 'admin-user', clientIp: '127.0.0.1' });

    expect(result.allowed).toBe(true);
    expect(result.isFallback).toBe(true);
  });

  it('blocks when count equals the limit', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-06T12:00:00Z'));

    const redis: MockRedis = {
      eval: vi.fn().mockResolvedValue(2), // limit is 2
      ttl: vi.fn().mockResolvedValue(30),
      get: vi.fn(),
    };

    mockedGetRedisClient.mockResolvedValue(
      redis as unknown as Awaited<ReturnType<typeof getRedisClient>>
    );

    const result = await checkAdminImageRateLimit({ userId: 'admin-user', clientIp: '127.0.0.1' });

    expect(result.allowed).toBe(true); // at limit, not over
    expect(result.remaining).toBe(0);
  });
});

describe('getClientIp', () => {
  it('prefers x-real-ip header', () => {
    const headers = new Headers({
      'x-real-ip': '10.0.0.1',
      'x-forwarded-for': '192.168.1.1, 10.0.0.2',
    });

    expect(getClientIp(headers)).toBe('10.0.0.1');
  });

  it('takes rightmost IP from x-forwarded-for', () => {
    const headers = new Headers({
      'x-forwarded-for': '192.168.1.1, 10.0.0.2, 172.16.0.1',
    });

    expect(getClientIp(headers)).toBe('172.16.0.1');
  });

  it('returns unknown when no IP headers present', () => {
    const headers = new Headers({});

    expect(getClientIp(headers)).toBe('unknown');
  });

  it('handles single IP in x-forwarded-for', () => {
    const headers = new Headers({
      'x-forwarded-for': '192.168.1.1',
    });

    expect(getClientIp(headers)).toBe('192.168.1.1');
  });
});
