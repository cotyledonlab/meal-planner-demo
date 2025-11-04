import { z } from 'zod';
import { hash } from '@node-rs/argon2';
import { randomBytes } from 'crypto';
import { TRPCError } from '@trpc/server';

import { createTRPCRouter, publicProcedure } from '~/server/api/trpc';
import { sendPasswordResetEmail } from '~/server/email';

const PASSWORD_RESET_TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour
const MAX_RESET_REQUESTS_PER_HOUR = 3;

// In-memory rate limiter (for production, use Redis)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(email: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(email);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(email, {
      count: 1,
      resetAt: now + 60 * 60 * 1000,
    });
    return true;
  }

  if (record.count >= MAX_RESET_REQUESTS_PER_HOUR) {
    return false;
  }

  record.count++;
  return true;
}

function generateResetToken(): string {
  return randomBytes(32).toString('hex');
}

export const passwordResetRouter = createTRPCRouter({
  requestReset: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ ctx, input }) => {
      // Check rate limit
      if (!checkRateLimit(input.email)) {
        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message: 'Too many reset requests. Please try again later.',
        });
      }

      // Find user by email
      const user = await ctx.db.user.findUnique({
        where: { email: input.email },
      });

      // Always return success to prevent user enumeration
      if (!user) {
        return {
          message: "If an account exists, you'll receive a reset email",
        };
      }

      // Generate token
      const token = generateResetToken();
      const expiresAt = new Date(Date.now() + PASSWORD_RESET_TOKEN_EXPIRY);

      // Store token in database
      await ctx.db.passwordResetToken.create({
        data: {
          token,
          userId: user.id,
          expiresAt,
        },
      });

      // Send email
      await sendPasswordResetEmail(user.email!, user.name, token);

      return {
        message: "If an account exists, you'll receive a reset email",
      };
    }),

  verifyToken: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ ctx, input }) => {
      const resetToken = await ctx.db.passwordResetToken.findUnique({
        where: { token: input.token },
      });

      if (!resetToken) {
        return { valid: false };
      }

      if (resetToken.used) {
        return { valid: false };
      }

      if (resetToken.expiresAt < new Date()) {
        return { valid: false };
      }

      return { valid: true };
    }),

  resetPassword: publicProcedure
    .input(
      z.object({
        token: z.string(),
        password: z.string().min(8),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Find token
      const resetToken = await ctx.db.passwordResetToken.findUnique({
        where: { token: input.token },
        include: { user: true },
      });

      if (!resetToken) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid or expired reset token',
        });
      }

      if (resetToken.used) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'This reset link has already been used',
        });
      }

      if (resetToken.expiresAt < new Date()) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'This reset link has expired',
        });
      }

      // Hash new password
      const passwordHash = await hash(input.password, {
        memoryCost: 19456,
        timeCost: 2,
        outputLen: 32,
        parallelism: 1,
      });

      // Update password and mark token as used
      await ctx.db.$transaction([
        ctx.db.password.upsert({
          where: { userId: resetToken.userId },
          update: { hash: passwordHash },
          create: {
            userId: resetToken.userId,
            hash: passwordHash,
          },
        }),
        ctx.db.passwordResetToken.update({
          where: { id: resetToken.id },
          data: {
            used: true,
            usedAt: new Date(),
          },
        }),
      ]);

      return { success: true };
    }),
});
