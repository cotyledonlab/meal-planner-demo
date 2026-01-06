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

  // Check if existing client is still connected
  if (client) {
    if (client.isOpen) {
      return client;
    }
    // Client exists but connection dropped - reset and reconnect
    client = null;
  }

  if (connectPromise) {
    return connectPromise;
  }

  const redisClient = createClient({ url: env.REDIS_URL });

  // Handle connection errors on an established connection
  redisClient.on('error', (error: Error) => {
    log.warn(
      { error: error.message },
      'Redis connection error'
    );
    // Reset client so next call will attempt to reconnect
    if (client === redisClient) {
      client = null;
    }
  });

  connectPromise = redisClient
    .connect()
    .then(() => {
      client = redisClient;
      return client;
    })
    .catch((error: unknown) => {
      log.warn(
        { error: error instanceof Error ? error.message : String(error) },
        'Redis unavailable; falling back to in-memory behavior'
      );
      try {
        void redisClient.disconnect();
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

export async function disconnectRedisClient(): Promise<void> {
  if (!client) {
    return;
  }

  const currentClient = client;
  client = null;

  try {
    await currentClient.quit();
  } catch (err) {
    log.warn(
      { error: err instanceof Error ? err.message : String(err) },
      'Failed to gracefully disconnect Redis client'
    );
    try {
      void currentClient.disconnect();
    } catch {
      // Ignore disconnect failures during shutdown.
    }
  }
}
