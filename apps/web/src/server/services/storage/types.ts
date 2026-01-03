/**
 * Storage provider abstraction for file storage operations.
 * Supports local filesystem and S3-compatible object storage.
 */

export interface SaveImageInput {
  /** Image data as a Buffer */
  data: Buffer;
  /** MIME type of the image (e.g., 'image/png', 'image/webp') */
  mimeType: string;
  /** Storage key/path for the image */
  key: string;
}

export interface SaveImageResult {
  /** Storage key/path of the saved image */
  key: string;
  /** Public URL or relative path to access the image */
  url: string;
  /** Absolute filesystem path (local storage only) */
  absolutePath?: string;
  /** Size of the image in bytes */
  fileSize: number;
}

export interface StorageProvider {
  /**
   * Save an image to storage
   */
  save(input: SaveImageInput): Promise<SaveImageResult>;

  /**
   * Delete an image from storage
   */
  delete(key: string): Promise<void>;

  /**
   * Get a signed URL for private bucket access (S3 only)
   */
  getSignedUrl?(key: string, expiresIn?: number): Promise<string>;
}

export interface LocalStorageConfig {
  /** Base directory for storing files (e.g., '/path/to/public') */
  basePath: string;
  /** Public URL prefix (e.g., '/generated-images') */
  publicPath: string;
}

export interface S3StorageConfig {
  /** S3 bucket name */
  bucket: string;
  /** AWS region (default: 'us-east-1') */
  region: string;
  /** AWS access key ID */
  accessKeyId: string;
  /** AWS secret access key */
  secretAccessKey: string;
  /** Custom endpoint for S3-compatible services (MinIO, DigitalOcean Spaces, etc.) */
  endpoint?: string;
  /** Use path-style addressing (required for some S3-compatible services) */
  forcePathStyle?: boolean;
  /** Public URL prefix for serving files (optional, for CDN or custom domain) */
  publicUrlPrefix?: string;
}
