import { describe, it, expect } from 'vitest';
import { LocalStorageProvider } from './localStorageProvider';

describe('LocalStorageProvider', () => {
  describe('save', () => {
    it('throws error for empty buffer', async () => {
      const provider = new LocalStorageProvider({
        basePath: '/app/public',
        publicPath: '/generated-images',
      });

      const input = {
        data: Buffer.from(''),
        mimeType: 'image/png',
        key: 'test.png',
      };

      await expect(provider.save(input)).rejects.toThrow('Cannot save empty image buffer');
    });

    it('generates correct URL and path structure', async () => {
      const provider = new LocalStorageProvider({
        basePath: '/tmp/test-storage',
        publicPath: '/uploads',
      });

      const input = {
        data: Buffer.from('test-data'),
        mimeType: 'image/png',
        key: 'test-image.png',
      };

      // This will actually write a file, but to /tmp which is allowed
      const result = await provider.save(input);

      expect(result.key).toBe('test-image.png');
      expect(result.url).toBe('/uploads/test-image.png');
      expect(result.absolutePath).toBe('/tmp/test-storage/uploads/test-image.png');
      expect(result.fileSize).toBe(input.data.length);
    });

    it('handles nested keys correctly', async () => {
      const provider = new LocalStorageProvider({
        basePath: '/tmp/test-storage',
        publicPath: '/uploads',
      });

      const input = {
        data: Buffer.from('test'),
        mimeType: 'image/webp',
        key: 'subfolder/deep/image.webp',
      };

      const result = await provider.save(input);

      expect(result.url).toBe('/uploads/subfolder/deep/image.webp');
      expect(result.absolutePath).toBe('/tmp/test-storage/uploads/subfolder/deep/image.webp');
    });
  });

  describe('delete', () => {
    it('does not throw when deleting non-existent file', async () => {
      const provider = new LocalStorageProvider({
        basePath: '/tmp/test-storage',
        publicPath: '/uploads',
      });

      // Should not throw - file doesn't exist
      await expect(
        provider.delete('non-existent-file-' + Date.now() + '.png')
      ).resolves.toBeUndefined();
    });

    it('deletes existing file without error', async () => {
      const provider = new LocalStorageProvider({
        basePath: '/tmp/test-storage',
        publicPath: '/uploads',
      });

      // First create a file
      const key = 'to-delete-' + Date.now() + '.png';
      await provider.save({
        data: Buffer.from('test'),
        mimeType: 'image/png',
        key,
      });

      // Then delete it
      await expect(provider.delete(key)).resolves.toBeUndefined();
    });
  });
});
