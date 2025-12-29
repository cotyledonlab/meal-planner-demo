import { z } from 'zod';
import { TRPCError } from '@trpc/server';

import { createTRPCRouter, adminProcedure } from '~/server/api/trpc';
import { GeminiImageClient, isGeminiConfigured } from '~/server/services/geminiImage';
import { saveGeneratedImage } from '~/server/services/imageStorage';
import { createLogger } from '~/lib/logger';
import { env } from '~/env';

const log = createLogger('admin-image-router');

const aspectRatioSchema = z.enum(['1:1', '16:9', '4:5']).default('1:1');

export const adminImageRouter = createTRPCRouter({
  list: adminProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(50).default(12),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 12;
      const images = await ctx.db.generatedImage.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: {
            select: { id: true, email: true, name: true },
          },
        },
        take: limit,
      });

      const basePath = env.NEXT_PUBLIC_BASE_PATH ?? '';

      return images.map((image) => ({
        ...image,
        publicUrl: `${basePath}${image.filePath}`,
      }));
    }),

  generate: adminProcedure
    .input(
      z.object({
        prompt: z.string().min(10).max(600),
        aspectRatio: aspectRatioSchema,
        model: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!isGeminiConfigured()) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'Gemini API is not configured. Set GEMINI_API_KEY to enable generation.',
        });
      }

      const gemini = new GeminiImageClient(
        input.model ? { model: input.model, disableFallback: true } : undefined
      );

      try {
        const image = await gemini.generateImage({
          prompt: input.prompt,
          aspectRatio: input.aspectRatio,
        });

        const saved = await saveGeneratedImage({
          data: image.data,
          mimeType: image.mimeType,
          prompt: input.prompt,
        });

        const record = await ctx.db.generatedImage.create({
          data: {
            prompt: input.prompt,
            model: image.model,
            mimeType: image.mimeType,
            filePath: saved.relativePath,
            fileSize: saved.fileSize,
            width: image.width,
            height: image.height,
            createdById: ctx.session.user.id,
          },
          include: {
            createdBy: {
              select: { id: true, email: true, name: true },
            },
          },
        });

        const basePath = env.NEXT_PUBLIC_BASE_PATH ?? '';

        return {
          ...record,
          publicUrl: `${basePath}${record.filePath}`,
        };
      } catch (error) {
        log.error({ error, userId: ctx.session.user.id }, 'Failed to generate Gemini image');
        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error instanceof Error ? error.message : 'Failed to generate image with Gemini API',
          cause: error instanceof Error ? error : undefined,
        });
      }
    }),
});
