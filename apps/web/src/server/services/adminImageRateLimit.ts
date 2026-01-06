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

/**
 * Extract client IP from request headers.
 *
 * Note: x-forwarded-for can be spoofed by clients. In production deployments
 * behind trusted proxies, the rightmost IP in the chain is typically the most
 * reliable. This implementation takes the rightmost non-empty IP from
 * x-forwarded-for as a defense against simple spoofing attempts.
 *
 * For additional security, consider configuring your proxy to set a trusted
 * header (like x-real-ip) that cannot be spoofed by clients.
 */
export function getClientIp(headers: Headers): string {
  // Prefer x-real-ip if set by a trusted proxy
  const realIp = headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }

  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    // Take the rightmost IP as it's harder to spoof in proxy chains
    const ips = forwarded
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);
    if (ips.length > 0) {
      return ips[ips.length - 1]!;
    }
  }

  return 'unknown';
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

  // Lua script for atomic INCR + EXPIRE to prevent race conditions
  const atomicIncrScript = `
    local current = redis.call("INCR", KEYS[1])
    if current == 1 then
      redis.call("EXPIRE", KEYS[1], ARGV[1])
    end
    return current
  `;

  try {
    const count = (await redis.eval(atomicIncrScript, {
      keys: [key],
      arguments: [String(WINDOW_SECONDS)],
    })) as number;

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
