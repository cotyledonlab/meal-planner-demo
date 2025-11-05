import { z } from 'zod';
import { hash } from '@node-rs/argon2';
import { createHash, randomBytes } from 'crypto';
import { TRPCError } from '@trpc/server';

import { createTRPCRouter, publicProcedure } from '~/server/api/trpc';
import { sendPasswordResetEmail } from '~/server/email';
import { createLogger } from '~/lib/logger';

const PASSWORD_RESET_TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour
const MAX_RESET_REQUESTS_PER_HOUR = 3;

const log = createLogger('passwordReset');

// In-memory rate limiter (for production, use Redis)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

type RateLimitResult = { allowed: boolean; attempts: number; resetAt: number };

function checkRateLimit(email: string): RateLimitResult {
  const now = Date.now();
  const record = rateLimitMap.get(email);

  if (!record || now > record.resetAt) {
    const resetAt = now + 60 * 60 * 1000;
    rateLimitMap.set(email, {
      count: 1,
      resetAt,
    });
    return { allowed: true, attempts: 1, resetAt };
  }

  if (record.count >= MAX_RESET_REQUESTS_PER_HOUR) {
    return { allowed: false, attempts: record.count, resetAt: record.resetAt };
  }

  record.count++;
  return { allowed: true, attempts: record.count, resetAt: record.resetAt };
}

function generateResetToken(): string {
  return randomBytes(32).toString('hex');
}

function anonymizeEmail(email: string): string {
  return createHash('sha256').update(email.trim().toLowerCase()).digest('hex');
}

function anonymizeToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function getEmailDomain(email: string): string {
  const [, domain] = email.split('@');
  return domain?.toLowerCase() ?? 'unknown';
}

function getClientIp(headers: Headers): string | undefined {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    const candidate = forwarded
      .split(',')
      .map((value) => value.trim())
      .find(Boolean);
    if (candidate) {
      return candidate;
    }
  }

  const realIp = headers.get('x-real-ip');
  return realIp ?? undefined;
}

function tokenExpiresAt(expiresAt: Date) {
  return expiresAt.toISOString();
}

function getErrorForLog(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
    };
  }

  return { message: String(error) };
}

export const passwordResetRouter = createTRPCRouter({
  requestReset: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ ctx, input }) => {
      const emailHash = anonymizeEmail(input.email);
      const emailDomain = getEmailDomain(input.email);
      const clientIp = getClientIp(ctx.headers);

      log.info({ emailHash, emailDomain, clientIp }, 'password reset request received');

      // Check rate limit
      const rateLimit = checkRateLimit(input.email);
      if (!rateLimit.allowed) {
        log.warn(
          {
            emailHash,
            emailDomain,
            clientIp,
            attempts: rateLimit.attempts,
            rateLimitResetAt: new Date(rateLimit.resetAt).toISOString(),
          },
          'password reset request blocked by rate limit'
        );
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
        log.info(
          {
            emailHash,
            emailDomain,
            clientIp,
            attempts: rateLimit.attempts,
            userExists: false,
          },
          'password reset request accepted for unknown user'
        );
        return {
          message: "If an account exists, you'll receive a reset email",
        };
      }

      // Generate token
      const token = generateResetToken();
      const expiresAt = new Date(Date.now() + PASSWORD_RESET_TOKEN_EXPIRY);

      // Store token in database
      const resetTokenRecord = await ctx.db.passwordResetToken.create({
        data: {
          token,
          userId: user.id,
          expiresAt,
        },
      });

      log.info(
        {
          emailHash,
          emailDomain,
          clientIp,
          attempts: rateLimit.attempts,
          userId: user.id,
          tokenId: resetTokenRecord.id,
          expiresAt: tokenExpiresAt(expiresAt),
        },
        'password reset token created'
      );

      // Send email
      try {
        await sendPasswordResetEmail(user.email!, user.name, token);
        log.info(
          {
            emailHash,
            emailDomain,
            clientIp,
            userId: user.id,
            tokenId: resetTokenRecord.id,
          },
          'password reset email sent'
        );
      } catch (error) {
        log.error(
          {
            emailHash,
            emailDomain,
            clientIp,
            userId: user.id,
            tokenId: resetTokenRecord.id,
            err: getErrorForLog(error),
          },
          'password reset email failed'
        );
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Unable to process password reset request. Please try again later.',
          cause: error instanceof Error ? error : undefined,
        });
      }

      return {
        message: "If an account exists, you'll receive a reset email",
      };
    }),

  verifyToken: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ ctx, input }) => {
      const tokenHash = anonymizeToken(input.token);
      const resetToken = await ctx.db.passwordResetToken.findUnique({
        where: { token: input.token },
        include: {
          user: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      });

      if (!resetToken) {
        log.warn(
          {
            tokenHash,
          },
          'password reset token not found'
        );
        return { valid: false };
      }

      if (resetToken.used) {
        log.warn(
          {
            tokenHash,
            userId: resetToken.userId,
            usedAt: resetToken.usedAt?.toISOString(),
          },
          'password reset token already used'
        );
        return { valid: false };
      }

      if (resetToken.expiresAt < new Date()) {
        log.warn(
          {
            tokenHash,
            userId: resetToken.userId,
            expiresAt: tokenExpiresAt(resetToken.expiresAt),
          },
          'password reset token expired'
        );
        return { valid: false };
      }

      log.info(
        {
          tokenHash,
          userId: resetToken.userId,
          emailHash: resetToken.user?.email ? anonymizeEmail(resetToken.user.email) : undefined,
        },
        'password reset token validated'
      );

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
      const tokenHash = anonymizeToken(input.token);
      // Find token
      const resetToken = await ctx.db.passwordResetToken.findUnique({
        where: { token: input.token },
        include: { user: true },
      });

      if (!resetToken) {
        log.warn(
          {
            tokenHash,
          },
          'password reset attempt with invalid token'
        );
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid or expired reset token',
        });
      }

      if (resetToken.used) {
        log.warn(
          {
            tokenHash,
            userId: resetToken.userId,
            usedAt: resetToken.usedAt?.toISOString(),
          },
          'password reset attempt with used token'
        );
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'This reset link has already been used',
        });
      }

      if (resetToken.expiresAt < new Date()) {
        log.warn(
          {
            tokenHash,
            userId: resetToken.userId,
            expiresAt: tokenExpiresAt(resetToken.expiresAt),
          },
          'password reset attempt with expired token'
        );
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'This reset link has expired',
        });
      }

      const emailHash = resetToken.user?.email ? anonymizeEmail(resetToken.user.email) : undefined;

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

      log.info(
        {
          tokenHash,
          userId: resetToken.userId,
          emailHash,
        },
        'password reset completed successfully'
      );

      return { success: true };
    }),
});
