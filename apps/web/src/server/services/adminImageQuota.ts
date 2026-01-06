import { adminImageGuardrails } from '~/server/services/adminImageGuardrails';
import { getRedisClient } from '~/server/services/redis';
import { createLogger } from '~/lib/logger';

const log = createLogger('admin-image-quota');

export interface DailyQuotaResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  resetAt: Date;
  used: number;
  isFallback: boolean;
}

function getUtcDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function getUtcResetAt(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1, 0, 0, 0)
  );
}

function getSecondsUntilUtcReset(date: Date): number {
  const resetAt = getUtcResetAt(date);
  const msRemaining = resetAt.getTime() - date.getTime();
  return Math.max(1, Math.ceil(msRemaining / 1000));
}

function getQuotaKey(userId: string, dateKey: string): string {
  return `admin-image:quota:${userId}:${dateKey}`;
}

export async function checkAdminImageDailyQuota(params: {
  userId: string;
}): Promise<DailyQuotaResult> {
  const limit = adminImageGuardrails.dailyLimit;
  const now = new Date();
  const dateKey = getUtcDateKey(now);
  const resetAt = getUtcResetAt(now);

  const redis = await getRedisClient();
  if (!redis) {
    return {
      allowed: true,
      remaining: limit,
      limit,
      resetAt,
      used: 0,
      isFallback: true,
    };
  }

  const key = getQuotaKey(params.userId, dateKey);

  try {
    const raw = await redis.get(key);
    const used = raw ? Number.parseInt(raw, 10) : 0;
    const normalizedUsed = Number.isFinite(used) ? used : 0;
    const remaining = Math.max(0, limit - normalizedUsed);

    return {
      allowed: normalizedUsed < limit,
      remaining,
      limit,
      resetAt,
      used: normalizedUsed,
      isFallback: false,
    };
  } catch (error) {
    log.warn(
      { error: error instanceof Error ? error.message : String(error) },
      'Redis quota check failed; allowing request'
    );
    return {
      allowed: true,
      remaining: limit,
      limit,
      resetAt,
      used: 0,
      isFallback: true,
    };
  }
}

export async function incrementAdminImageDailyUsage(params: { userId: string }): Promise<void> {
  const redis = await getRedisClient();
  if (!redis) {
    return;
  }

  const now = new Date();
  const dateKey = getUtcDateKey(now);
  const key = getQuotaKey(params.userId, dateKey);

  // Lua script for atomic INCR + EXPIRE to prevent race conditions
  const atomicIncrScript = `
    local current = redis.call("INCR", KEYS[1])
    if current == 1 then
      redis.call("EXPIRE", KEYS[1], ARGV[1])
    end
    return current
  `;

  try {
    const ttlSeconds = getSecondsUntilUtcReset(now);
    await redis.eval(atomicIncrScript, {
      keys: [key],
      arguments: [String(ttlSeconds)],
    });
  } catch (error) {
    log.warn(
      { error: error instanceof Error ? error.message : String(error) },
      'Redis quota increment failed'
    );
  }
}
