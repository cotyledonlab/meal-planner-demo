#!/usr/bin/env tsx
import { PrismaClient } from '@prisma/client';

import { GeminiImageClient } from '~/server/services/geminiImage';
import { saveGeneratedImage } from '~/server/services/imageStorage';

const prisma = new PrismaClient();

async function main() {
  const admin =
    (await prisma.user.findFirst({ where: { role: 'admin' } })) ??
    (await prisma.user.create({
      data: {
        email: `admin+generated-${Date.now()}@example.com`,
        name: 'Generated Admin',
        role: 'admin',
      },
    }));

  const prompt =
    'Editorial product shot of a rustic Irish-inspired grain bowl with fresh herbs and soft morning light, 4k photo';

  const gemini = new GeminiImageClient();
  const image = await gemini.generateImage({ prompt, aspectRatio: '4:5' });
  const saved = await saveGeneratedImage({ data: image.data, mimeType: image.mimeType, prompt });

  const record = await prisma.generatedImage.create({
    data: {
      prompt,
      model: image.model,
      mimeType: image.mimeType,
      filePath: saved.relativePath,
      fileSize: saved.fileSize,
      width: image.width,
      height: image.height,
      createdById: admin.id,
    },
  });

  console.log('Generated image stored at:', saved.relativePath);
  console.log('Database record id:', record.id);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
