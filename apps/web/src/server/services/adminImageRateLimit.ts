import { adminImageGuardrails } from '~/server/services/adminImageGuardrails';
import { getRedisClient } from '~/server/services/redis';
import { createLogger } from '~/lib/logger';

const log = createLogger('admin-image-rate-limit');

const WINDOW_SECONDS = 60;

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  isFallback: boolean;
}

export interface RateLimitStatus {
  limit: number;
  remaining: number;
  resetAt: Date;
  windowSeconds: number;
  isFallback: boolean;
}

function getClientKey(userId: string, clientIp: string) {
  return `admin-image:rate:${userId}:${clientIp}`;
}

export function getClientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    const candidate = forwarded
      .split(',')
      .map((value) => value.trim())
      .find(Boolean);
    if (candidate) {
      return candidate;
    }
  }

  const realIp = headers.get('x-real-ip');
  return realIp ?? 'unknown';
}

export async function checkAdminImageRateLimit(params: {
  userId: string;
  clientIp: string;
}): Promise<RateLimitResult> {
  const limit = adminImageGuardrails.rateLimitPerMinute;
  const now = Date.now();
  const resetAtFallback = new Date(now + WINDOW_SECONDS * 1000);

  const redis = await getRedisClient();
  if (!redis) {
    return {
      allowed: true,
      remaining: limit,
      resetAt: resetAtFallback,
      isFallback: true,
    };
  }

  const key = getClientKey(params.userId, params.clientIp);

  try {
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, WINDOW_SECONDS);
    }

    const ttl = await redis.ttl(key);
    const resetAt = ttl > 0 ? new Date(now + ttl * 1000) : resetAtFallback;
    const remaining = Math.max(0, limit - count);

    return {
      allowed: count <= limit,
      remaining,
      resetAt,
      isFallback: false,
    };
  } catch (error) {
    log.warn(
      { error: error instanceof Error ? error.message : String(error) },
      'Redis rate limit check failed; allowing request'
    );
    return {
      allowed: true,
      remaining: limit,
      resetAt: resetAtFallback,
      isFallback: true,
    };
  }
}

export async function getAdminImageRateLimitStatus(params: {
  userId: string;
  clientIp: string;
}): Promise<RateLimitStatus> {
  const limit = adminImageGuardrails.rateLimitPerMinute;
  const now = Date.now();
  const resetAtFallback = new Date(now + WINDOW_SECONDS * 1000);

  const redis = await getRedisClient();
  if (!redis) {
    return {
      limit,
      remaining: limit,
      resetAt: resetAtFallback,
      windowSeconds: WINDOW_SECONDS,
      isFallback: true,
    };
  }

  const key = getClientKey(params.userId, params.clientIp);

  try {
    const raw = await redis.get(key);
    const ttl = await redis.ttl(key);
    const used = raw ? Number.parseInt(raw, 10) : 0;
    const normalizedUsed = Number.isFinite(used) ? used : 0;
    const resetAt = ttl > 0 ? new Date(now + ttl * 1000) : resetAtFallback;
    const remaining = Math.max(0, limit - normalizedUsed);

    return {
      limit,
      remaining,
      resetAt,
      windowSeconds: WINDOW_SECONDS,
      isFallback: false,
    };
  } catch (error) {
    log.warn(
      { error: error instanceof Error ? error.message : String(error) },
      'Redis rate limit status check failed; using fallback'
    );
    return {
      limit,
      remaining: limit,
      resetAt: resetAtFallback,
      windowSeconds: WINDOW_SECONDS,
      isFallback: true,
    };
  }
}
