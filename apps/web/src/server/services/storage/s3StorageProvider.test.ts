import { describe, it, expect, vi, beforeEach } from 'vitest';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3StorageProvider } from './s3StorageProvider';

// Mock AWS SDK
vi.mock('@aws-sdk/client-s3', () => {
  const mockSend = vi.fn().mockResolvedValue({});
  return {
    S3Client: vi.fn().mockImplementation(() => ({
      send: mockSend,
    })),
    PutObjectCommand: vi.fn().mockImplementation((input) => ({ input, type: 'PutObject' })),
    DeleteObjectCommand: vi.fn().mockImplementation((input) => ({ input, type: 'DeleteObject' })),
    GetObjectCommand: vi.fn().mockImplementation((input) => ({ input, type: 'GetObject' })),
  };
});

vi.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: vi.fn().mockResolvedValue('https://signed-url.example.com'),
}));

describe('S3StorageProvider', () => {
  const defaultConfig = {
    bucket: 'test-bucket',
    region: 'us-east-1',
    accessKeyId: 'test-access-key',
    secretAccessKey: 'test-secret-key',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('creates S3Client with correct configuration', () => {
      new S3StorageProvider(defaultConfig);

      expect(S3Client).toHaveBeenCalledWith({
        region: 'us-east-1',
        credentials: {
          accessKeyId: 'test-access-key',
          secretAccessKey: 'test-secret-key',
        },
      });
    });

    it('includes endpoint for S3-compatible services', () => {
      new S3StorageProvider({
        ...defaultConfig,
        endpoint: 'https://minio.example.com',
        forcePathStyle: true,
      });

      expect(S3Client).toHaveBeenCalledWith(
        expect.objectContaining({
          endpoint: 'https://minio.example.com',
          forcePathStyle: true,
        })
      );
    });
  });

  describe('save', () => {
    it('uploads image to S3 and returns correct result', async () => {
      const provider = new S3StorageProvider(defaultConfig);
      const input = {
        data: Buffer.from('fake-image-data'),
        mimeType: 'image/png',
        key: 'test-image.png',
      };

      const result = await provider.save(input);

      expect(result.key).toBe('test-image.png');
      expect(result.url).toBe('https://test-bucket.s3.us-east-1.amazonaws.com/test-image.png');
      expect(result.fileSize).toBe(input.data.length);
      expect(result.absolutePath).toBeUndefined();
    });

    it('throws error for empty buffer', async () => {
      const provider = new S3StorageProvider(defaultConfig);
      const input = {
        data: Buffer.from(''),
        mimeType: 'image/png',
        key: 'test.png',
      };

      await expect(provider.save(input)).rejects.toThrow('Cannot save empty image buffer');
    });

    it('uses custom public URL prefix when configured', async () => {
      const customProvider = new S3StorageProvider({
        ...defaultConfig,
        publicUrlPrefix: 'https://cdn.example.com/images',
      });

      const result = await customProvider.save({
        data: Buffer.from('test'),
        mimeType: 'image/png',
        key: 'test.png',
      });

      expect(result.url).toBe('https://cdn.example.com/images/test.png');
    });

    it('constructs correct URL for S3-compatible with path style', async () => {
      const minioProvider = new S3StorageProvider({
        ...defaultConfig,
        endpoint: 'https://minio.example.com',
        forcePathStyle: true,
      });

      const result = await minioProvider.save({
        data: Buffer.from('test'),
        mimeType: 'image/png',
        key: 'test.png',
      });

      expect(result.url).toBe('https://minio.example.com/test-bucket/test.png');
    });

    it('constructs correct URL for S3-compatible with virtual-hosted style', async () => {
      const spacesProvider = new S3StorageProvider({
        ...defaultConfig,
        endpoint: 'https://nyc3.digitaloceanspaces.com',
        forcePathStyle: false,
      });

      const result = await spacesProvider.save({
        data: Buffer.from('test'),
        mimeType: 'image/png',
        key: 'test.png',
      });

      expect(result.url).toBe('https://test-bucket.nyc3.digitaloceanspaces.com/test.png');
    });
  });

  describe('delete', () => {
    it('deletes object from S3', async () => {
      const provider = new S3StorageProvider(defaultConfig);
      await provider.delete('test-image.png');

      expect(DeleteObjectCommand).toHaveBeenCalledWith({
        Bucket: 'test-bucket',
        Key: 'test-image.png',
      });
    });
  });

  describe('getSignedUrl', () => {
    it('returns signed URL for private access', async () => {
      const provider = new S3StorageProvider(defaultConfig);
      const result = await provider.getSignedUrl('private-image.png');

      expect(result).toBe('https://signed-url.example.com');
      expect(GetObjectCommand).toHaveBeenCalledWith({
        Bucket: 'test-bucket',
        Key: 'private-image.png',
      });
    });

    it('uses custom expiration time', async () => {
      const provider = new S3StorageProvider(defaultConfig);
      await provider.getSignedUrl('image.png', 7200);

      expect(getSignedUrl).toHaveBeenCalledWith(expect.anything(), expect.anything(), {
        expiresIn: 7200,
      });
    });

    it('uses default expiration of 3600 seconds', async () => {
      const provider = new S3StorageProvider(defaultConfig);
      await provider.getSignedUrl('image.png');

      expect(getSignedUrl).toHaveBeenCalledWith(expect.anything(), expect.anything(), {
        expiresIn: 3600,
      });
    });
  });
});
