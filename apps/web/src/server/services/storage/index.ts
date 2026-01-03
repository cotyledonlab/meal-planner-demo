import { existsSync } from 'fs';
import path from 'path';
import { env } from '~/env';
import { LocalStorageProvider } from './localStorageProvider';
import { S3StorageProvider } from './s3StorageProvider';
import type { StorageProvider } from './types';

export * from './types';
export { LocalStorageProvider } from './localStorageProvider';
export { S3StorageProvider } from './s3StorageProvider';

/**
 * Resolve the public directory for local storage.
 * Handles both direct execution and monorepo structure.
 */
function resolvePublicDir(): string {
  const cwd = process.cwd();
  const directPublic = path.join(cwd, 'public');
  if (existsSync(directPublic)) {
    return directPublic;
  }
  return path.join(cwd, 'apps', 'web', 'public');
}

/**
 * Create a storage provider based on environment configuration.
 */
export function createStorageProvider(): StorageProvider {
  const provider = env.STORAGE_PROVIDER ?? 'local';

  if (provider === 's3') {
    // Validate required S3 configuration
    if (!env.S3_BUCKET || !env.S3_ACCESS_KEY_ID || !env.S3_SECRET_ACCESS_KEY) {
      throw new Error(
        'S3 storage requires S3_BUCKET, S3_ACCESS_KEY_ID, and S3_SECRET_ACCESS_KEY environment variables'
      );
    }

    return new S3StorageProvider({
      bucket: env.S3_BUCKET,
      region: env.S3_REGION ?? 'us-east-1',
      accessKeyId: env.S3_ACCESS_KEY_ID,
      secretAccessKey: env.S3_SECRET_ACCESS_KEY,
      endpoint: env.S3_ENDPOINT,
      forcePathStyle: env.S3_FORCE_PATH_STYLE === 'true',
      publicUrlPrefix: env.S3_PUBLIC_URL_PREFIX,
    });
  }

  return new LocalStorageProvider({
    basePath: resolvePublicDir(),
    publicPath: '/generated-images',
  });
}

// Singleton instance for consistent usage across the application
let storageProviderInstance: StorageProvider | null = null;

/**
 * Get the storage provider singleton.
 * Creates a new instance on first call based on environment configuration.
 */
export function getStorageProvider(): StorageProvider {
  if (!storageProviderInstance) {
    storageProviderInstance = createStorageProvider();
  }
  return storageProviderInstance;
}

/**
 * Reset the storage provider singleton.
 * Useful for testing or reconfiguration.
 */
export function resetStorageProvider(): void {
  storageProviderInstance = null;
}
