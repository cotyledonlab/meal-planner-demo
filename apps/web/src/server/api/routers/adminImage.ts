import { z } from 'zod';
import { TRPCError } from '@trpc/server';

import { AdminImageAuditStatus } from '@prisma/client';

import { createTRPCRouter, adminProcedure } from '~/server/api/trpc';
import {
  GeminiImageClient,
  isGeminiConfigured,
  resolveGeminiImageModel,
} from '~/server/services/geminiImage';
import { saveGeneratedImage } from '~/server/services/imageStorage';
import {
  checkAdminImageRateLimit,
  getAdminImageRateLimitStatus,
  getClientIp,
} from '~/server/services/adminImageRateLimit';
import { adminImageGuardrails } from '~/server/services/adminImageGuardrails';
import {
  checkAdminImageDailyQuota,
  incrementAdminImageDailyUsage,
} from '~/server/services/adminImageQuota';
import { recordAdminImageAuditLog } from '~/server/services/adminImageAuditLog';
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

  usage: adminProcedure.query(async ({ ctx }) => {
    const clientIp = getClientIp(ctx.headers);
    const [dailyQuota, rateLimit] = await Promise.all([
      checkAdminImageDailyQuota({ userId: ctx.session.user.id }),
      getAdminImageRateLimitStatus({ userId: ctx.session.user.id, clientIp }),
    ]);

    return {
      daily: {
        used: dailyQuota.used,
        remaining: dailyQuota.remaining,
        limit: dailyQuota.limit,
        resetAt: dailyQuota.resetAt,
        isFallback: dailyQuota.isFallback,
      },
      rateLimit: {
        remaining: rateLimit.remaining,
        limit: rateLimit.limit,
        resetAt: rateLimit.resetAt,
        windowSeconds: rateLimit.windowSeconds,
        isFallback: rateLimit.isFallback,
      },
      maintenanceMode: adminImageGuardrails.maintenanceMode,
    };
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
      const promptLength = input.prompt.length;
      const resolvedModel = resolveGeminiImageModel(input.model);

      if (adminImageGuardrails.maintenanceMode) {
        await recordAdminImageAuditLog({
          db: ctx.db,
          userId: ctx.session.user.id,
          model: resolvedModel,
          promptLength,
          status: AdminImageAuditStatus.CONFIG_UNAVAILABLE,
          errorMessage: 'Admin image generation disabled for maintenance',
        });

        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'Image generation is temporarily disabled for maintenance.',
        });
      }

      if (!isGeminiConfigured()) {
        await recordAdminImageAuditLog({
          db: ctx.db,
          userId: ctx.session.user.id,
          model: resolvedModel,
          promptLength,
          status: AdminImageAuditStatus.CONFIG_UNAVAILABLE,
          errorMessage: 'Gemini image generation is not configured',
        });

        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'Gemini API is not configured. Set GEMINI_API_KEY to enable generation.',
        });
      }

      const quota = await checkAdminImageDailyQuota({ userId: ctx.session.user.id });
      if (!quota.allowed) {
        await recordAdminImageAuditLog({
          db: ctx.db,
          userId: ctx.session.user.id,
          model: resolvedModel,
          promptLength,
          status: AdminImageAuditStatus.QUOTA_EXCEEDED,
          errorMessage: 'Daily admin image quota exceeded',
        });

        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message: `Daily image generation quota exceeded (${quota.limit}/day). Try again tomorrow.`,
        });
      }

      const clientIp = getClientIp(ctx.headers);
      const rateLimit = await checkAdminImageRateLimit({
        userId: ctx.session.user.id,
        clientIp,
      });

      if (!rateLimit.allowed) {
        await recordAdminImageAuditLog({
          db: ctx.db,
          userId: ctx.session.user.id,
          model: resolvedModel,
          promptLength,
          status: AdminImageAuditStatus.RATE_LIMITED,
          errorMessage: 'Admin image generation rate limit exceeded',
        });

        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message: 'Image generation rate limit exceeded. Please try again shortly.',
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

        await incrementAdminImageDailyUsage({ userId: ctx.session.user.id });

        const basePath = env.NEXT_PUBLIC_BASE_PATH ?? '';

        await recordAdminImageAuditLog({
          db: ctx.db,
          userId: ctx.session.user.id,
          model: image.model,
          promptLength,
          status: AdminImageAuditStatus.SUCCESS,
        });

        return {
          ...record,
          publicUrl: `${basePath}${record.filePath}`,
        };
      } catch (error) {
        await recordAdminImageAuditLog({
          db: ctx.db,
          userId: ctx.session.user.id,
          model: resolvedModel,
          promptLength,
          status: AdminImageAuditStatus.FAILED,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        });

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
