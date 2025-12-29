import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type * as fsp from 'fs/promises';
import type * as fs from 'fs';

// Mock fs modules
vi.mock('fs/promises', async (importOriginal) => {
  const actual = await importOriginal<typeof fsp>();
  return {
    ...actual,
    mkdir: vi.fn().mockResolvedValue(undefined),
    writeFile: vi.fn().mockResolvedValue(undefined),
  };
});

vi.mock('fs', async (importOriginal) => {
  const actual = await importOriginal<typeof fs>();
  return {
    ...actual,
    existsSync: vi.fn().mockReturnValue(true),
  };
});

// Import after mocks are set up
import { saveGeneratedImage } from './imageStorage';

// UUID pattern: 8-4-4-4-12 hex chars
const UUID_PATTERN = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';

describe('imageStorage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('saveGeneratedImage', () => {
    it('saves an image with correct filename format', async () => {
      const input = {
        data: Buffer.from('fake-image-data'),
        mimeType: 'image/png',
        prompt: 'A red apple on white background',
      };

      const result = await saveGeneratedImage(input);

      // Check filename format: slug-timestamp-uuid.ext
      expect(result.fileName).toMatch(
        new RegExp(`^a-red-apple-on-white-background-\\d+-${UUID_PATTERN}\\.png$`)
      );
      expect(result.relativePath).toBe(`/generated-images/${result.fileName}`);
      expect(result.fileSize).toBe(input.data.length);
      expect(result.absolutePath).toContain('generated-images');
      expect(result.absolutePath).toContain(result.fileName);
    });

    it('throws error for empty buffer', async () => {
      const input = {
        data: Buffer.from(''),
        mimeType: 'image/png',
        prompt: 'test',
      };

      await expect(saveGeneratedImage(input)).rejects.toThrow('Cannot save empty image buffer');
    });

    it('handles different MIME types correctly', async () => {
      const testCases = [
        { mimeType: 'image/png', expectedExt: '.png' },
        { mimeType: 'image/jpeg', expectedExt: '.jpg' },
        { mimeType: 'image/jpg', expectedExt: '.jpg' },
        { mimeType: 'image/webp', expectedExt: '.webp' },
        { mimeType: 'image/unknown', expectedExt: '.png' }, // fallback
      ];

      for (const { mimeType, expectedExt } of testCases) {
        const result = await saveGeneratedImage({
          data: Buffer.from('test'),
          mimeType,
          prompt: 'test-mime',
        });

        expect(result.fileName.endsWith(expectedExt)).toBe(true);
      }
    });

    it('truncates long prompts to 32 characters in slug', async () => {
      const longPrompt =
        'This is a very long prompt that should be truncated to thirty two characters maximum';

      const result = await saveGeneratedImage({
        data: Buffer.from('test'),
        mimeType: 'image/png',
        prompt: longPrompt,
      });

      // Extract slug part (before first timestamp)
      const parts = result.fileName.split('-');
      // Reconstruct slug (everything before the timestamp which is 13 digits)
      const slugParts: string[] = [];
      for (const part of parts) {
        if (/^\d{13}$/.test(part)) break;
        slugParts.push(part);
      }
      const slug = slugParts.join('-');

      expect(slug.length).toBeLessThanOrEqual(32);
    });

    it('handles prompts with special characters', async () => {
      const result = await saveGeneratedImage({
        data: Buffer.from('test'),
        mimeType: 'image/png',
        prompt: '!!!Hello @World### 123!!!',
      });

      // Should contain sanitized parts
      expect(result.fileName).toContain('hello');
      expect(result.fileName).toContain('world');
      expect(result.fileName).toContain('123');
      // Should not contain special chars
      expect(result.fileName).not.toMatch(/[!@#]/);
    });

    it('uses fallback name for empty prompt after sanitization', async () => {
      const result = await saveGeneratedImage({
        data: Buffer.from('test'),
        mimeType: 'image/png',
        prompt: '!!!@@@###', // All special chars
      });

      expect(result.fileName).toMatch(new RegExp(`^image-\\d+-${UUID_PATTERN}\\.png$`));
    });

    it('returns correct file size', async () => {
      const testData = Buffer.from('x'.repeat(1000));
      const result = await saveGeneratedImage({
        data: testData,
        mimeType: 'image/png',
        prompt: 'test',
      });

      expect(result.fileSize).toBe(1000);
    });
  });

  describe('resolvePublicDir', () => {
    it('includes public directory in path', async () => {
      const result = await saveGeneratedImage({
        data: Buffer.from('test'),
        mimeType: 'image/png',
        prompt: 'test',
      });

      expect(result.absolutePath).toContain('public');
      expect(result.absolutePath).toContain('generated-images');
    });
  });
});
