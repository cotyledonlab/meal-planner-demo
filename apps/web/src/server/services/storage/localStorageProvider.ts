import { mkdir, writeFile, unlink } from 'fs/promises';
import path from 'path';
import type { StorageProvider, SaveImageInput, SaveImageResult, LocalStorageConfig } from './types';

/**
 * Local filesystem storage provider.
 * Stores files in a local directory and serves them via a public URL path.
 */
export class LocalStorageProvider implements StorageProvider {
  private config: LocalStorageConfig;
  private ensureDirPromise: Promise<void> | null = null;

  constructor(config: LocalStorageConfig) {
    this.config = config;
  }

  private async ensureDir(): Promise<void> {
    this.ensureDirPromise ??= (async () => {
      try {
        const dir = path.join(this.config.basePath, this.config.publicPath);
        await mkdir(dir, { recursive: true });
      } catch (error) {
        this.ensureDirPromise = null;
        throw error;
      }
    })();

    await this.ensureDirPromise;
  }

  async save(input: SaveImageInput): Promise<SaveImageResult> {
    if (!input.data?.length) {
      throw new Error('Cannot save empty image buffer');
    }

    await this.ensureDir();

    const absolutePath = path.join(this.config.basePath, this.config.publicPath, input.key);
    const url = path.posix.join(this.config.publicPath, input.key);

    // Ensure parent directory exists for nested keys
    const parentDir = path.dirname(absolutePath);
    await mkdir(parentDir, { recursive: true });

    await writeFile(absolutePath, input.data);

    return {
      key: input.key,
      url,
      absolutePath,
      fileSize: input.data.length,
    };
  }

  async delete(key: string): Promise<void> {
    const absolutePath = path.join(this.config.basePath, this.config.publicPath, key);
    try {
      await unlink(absolutePath);
    } catch (error) {
      // Ignore if file doesn't exist
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
  }
}
