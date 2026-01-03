import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl as awsGetSignedUrl } from '@aws-sdk/s3-request-presigner';
import type {
  StorageProvider,
  SaveImageInput,
  SaveImageResult,
  S3StorageConfig,
} from './types';

/**
 * S3-compatible storage provider.
 * Works with AWS S3, MinIO, DigitalOcean Spaces, Cloudflare R2, and other S3-compatible services.
 */
export class S3StorageProvider implements StorageProvider {
  private client: S3Client;
  private config: S3StorageConfig;

  constructor(config: S3StorageConfig) {
    this.config = config;
    this.client = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      ...(config.endpoint && { endpoint: config.endpoint }),
      ...(config.forcePathStyle && { forcePathStyle: config.forcePathStyle }),
    });
  }

  async save(input: SaveImageInput): Promise<SaveImageResult> {
    if (!input.data?.length) {
      throw new Error('Cannot save empty image buffer');
    }

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.config.bucket,
        Key: input.key,
        Body: input.data,
        ContentType: input.mimeType,
      })
    );

    const url = this.getPublicUrl(input.key);

    return {
      key: input.key,
      url,
      fileSize: input.data.length,
    };
  }

  async delete(key: string): Promise<void> {
    try {
      await this.client.send(
        new DeleteObjectCommand({
          Bucket: this.config.bucket,
          Key: key,
        })
      );
    } catch (error) {
      // S3 doesn't error on deleting non-existent keys, but handle any other errors
      const s3Error = error as { name?: string };
      if (s3Error.name !== 'NoSuchKey') {
        throw error;
      }
    }
  }

  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.config.bucket,
      Key: key,
    });

    return awsGetSignedUrl(this.client, command, { expiresIn });
  }

  private getPublicUrl(key: string): string {
    // If a custom public URL prefix is configured (e.g., CDN), use that
    if (this.config.publicUrlPrefix) {
      return `${this.config.publicUrlPrefix.replace(/\/$/, '')}/${key}`;
    }

    // If using a custom endpoint (S3-compatible service), construct URL from endpoint
    if (this.config.endpoint) {
      const endpoint = this.config.endpoint.replace(/\/$/, '');
      if (this.config.forcePathStyle) {
        return `${endpoint}/${this.config.bucket}/${key}`;
      }
      // Virtual-hosted style
      const url = new URL(endpoint);
      url.hostname = `${this.config.bucket}.${url.hostname}`;
      url.pathname = `/${key}`;
      return url.toString();
    }

    // Default AWS S3 URL
    return `https://${this.config.bucket}.s3.${this.config.region}.amazonaws.com/${key}`;
  }
}
