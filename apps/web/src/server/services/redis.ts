import { createClient } from 'redis';

import { env } from '~/env';
import { createLogger } from '~/lib/logger';

const log = createLogger('redis');

type RedisClient = ReturnType<typeof createClient>;

let client: RedisClient | null = null;
let connectPromise: Promise<RedisClient | null> | null = null;

export async function getRedisClient(): Promise<RedisClient | null> {
  if (!env.REDIS_URL) {
    return null;
  }

  if (client) {
    return client;
  }

  if (connectPromise) {
    return connectPromise;
  }

  const redisClient = createClient({ url: env.REDIS_URL });

  connectPromise = redisClient
    .connect()
    .then(() => {
      client = redisClient;
      return client;
    })
    .catch((error) => {
      log.warn(
        { error: error instanceof Error ? error.message : String(error) },
        'Redis unavailable; falling back to in-memory behavior'
      );
      try {
        redisClient.disconnect();
      } catch {
        // Ignore disconnect failures on partial connections.
      }
      return null;
    })
    .finally(() => {
      connectPromise = null;
    });

  return connectPromise;
}
