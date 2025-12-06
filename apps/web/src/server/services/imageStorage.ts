import { existsSync } from 'fs';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const GENERATED_DIR = path.join(resolvePublicDir(), 'generated-images');
const MIME_EXTENSION: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/webp': 'webp',
};

let ensureDirPromise: Promise<void> | null = null;

async function ensureDir() {
  ensureDirPromise ??= (async () => {
    try {
      await mkdir(GENERATED_DIR, { recursive: true });
    } catch (error) {
      ensureDirPromise = null;
      throw error;
    }
  })();

  await ensureDirPromise;
}

function getExtension(mimeType: string) {
  return MIME_EXTENSION[mimeType] ?? 'png';
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

export async function saveGeneratedImage({
  data,
  mimeType,
  prompt,
}: SaveGeneratedImageInput): Promise<SaveGeneratedImageResult> {
  if (!data?.length) {
    throw new Error('Cannot save empty image buffer');
  }

  await ensureDir();

  const extension = getExtension(mimeType);
  const slug = prompt
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32);
  const fileName = `${slug || 'image'}-${Date.now()}-${crypto.randomUUID()}.${extension}`;
  const absolutePath = path.join(GENERATED_DIR, fileName);
  const relativePath = path.posix.join('/generated-images', fileName);

  await writeFile(absolutePath, data);

  return {
    fileName,
    absolutePath,
    relativePath,
    fileSize: data.length,
  };
}
function resolvePublicDir() {
  const cwd = process.cwd();
  const directPublic = path.join(cwd, 'public');
  if (existsSync(directPublic)) {
    return directPublic;
  }
  return path.join(cwd, 'apps', 'web', 'public');
}
