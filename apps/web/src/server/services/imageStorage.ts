import crypto from 'crypto';
import { getStorageProvider } from './storage';

const MIME_EXTENSION: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/webp': 'webp',
};

function getExtension(mimeType: string): string {
  return MIME_EXTENSION[mimeType] ?? 'png';
}

/**
 * Generate a storage key for an image based on prompt and MIME type.
 */
function generateImageKey(prompt: string, mimeType: string): string {
  const extension = getExtension(mimeType);
  const slug = prompt
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32);
  return `${slug || 'image'}-${Date.now()}-${crypto.randomUUID()}.${extension}`;
}

export interface SaveGeneratedImageInput {
  data: Buffer;
  mimeType: string;
  prompt: string;
}

export interface SaveGeneratedImageResult {
  fileName: string;
  absolutePath: string;
  relativePath: string;
  fileSize: number;
}

/**
 * Save a generated image using the configured storage provider.
 * Maintains backward compatibility with the original interface.
 */
export async function saveGeneratedImage({
  data,
  mimeType,
  prompt,
}: SaveGeneratedImageInput): Promise<SaveGeneratedImageResult> {
  const storage = getStorageProvider();
  const key = generateImageKey(prompt, mimeType);

  const result = await storage.save({
    data,
    mimeType,
    key,
  });

  return {
    fileName: key,
    absolutePath: result.absolutePath ?? result.url,
    relativePath: result.url,
    fileSize: result.fileSize,
  };
}
