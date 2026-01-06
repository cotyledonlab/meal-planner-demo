import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TRPCError } from '@trpc/server';
import { AdminImageAuditStatus } from '@prisma/client';

vi.mock('~/server/auth', () => ({ auth: vi.fn() }));

vi.mock('~/server/db', () => ({
  db: {
    generatedImage: {},
    adminImageAuditLog: {},
  },
}));

vi.mock('~/server/services/adminImageGuardrails', () => ({
  adminImageGuardrails: {
    dailyLimit: 100,
    rateLimitPerMinute: 20,
    maintenanceMode: true,
  },
}));

vi.mock('~/server/services/adminImageAuditLog', () => ({
  recordAdminImageAuditLog: vi.fn(),
}));

vi.mock('~/server/services/geminiImage', () => ({
  GeminiImageClient: vi.fn(),
  isGeminiConfigured: vi.fn().mockReturnValue(true),
  resolveGeminiImageModel: vi.fn().mockReturnValue('gemini-3-pro-image-preview'),
}));

vi.mock('~/server/services/adminImageQuota', () => ({
  checkAdminImageDailyQuota: vi.fn(),
  incrementAdminImageDailyUsage: vi.fn(),
}));

vi.mock('~/server/services/adminImageRateLimit', () => ({
  checkAdminImageRateLimit: vi.fn(),
  getAdminImageRateLimitStatus: vi.fn(),
  getClientIp: vi.fn().mockReturnValue('127.0.0.1'),
}));

vi.mock('~/server/services/imageStorage', () => ({
  saveGeneratedImage: vi.fn(),
}));

import { recordAdminImageAuditLog } from '~/server/services/adminImageAuditLog';
import { adminImageRouter } from './adminImage';
import { createMockContext, mockSession } from '~/test/mocks';

describe('adminImageRouter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('blocks generation during maintenance mode', async () => {
    const adminSession = {
      ...mockSession,
      user: {
        ...mockSession.user,
        role: 'admin',
      },
    };

    const ctx = createMockContext({ session: adminSession });
    const caller = adminImageRouter.createCaller(ctx);

    let error: TRPCError | null = null;

    try {
      await caller.generate({
        prompt: 'A prompt that is long enough',
        aspectRatio: '1:1',
      });
    } catch (caught) {
      error = caught as TRPCError;
    }

    expect(error).not.toBeNull();
    expect(error?.code).toBe('PRECONDITION_FAILED');
    expect(recordAdminImageAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        status: AdminImageAuditStatus.CONFIG_UNAVAILABLE,
        errorMessage: 'Admin image generation disabled for maintenance',
      })
    );
  });
});
