import type { AdminImageAuditStatus, PrismaClient } from '@prisma/client';

import { createLogger } from '~/lib/logger';

const log = createLogger('admin-image-audit-log');

interface AdminImageAuditLogInput {
  db: PrismaClient;
  userId: string | null;
  model: string | null;
  promptLength: number;
  status: AdminImageAuditStatus;
  errorMessage?: string | null;
}

export async function recordAdminImageAuditLog({
  db,
  userId,
  model,
  promptLength,
  status,
  errorMessage,
}: AdminImageAuditLogInput): Promise<void> {
  try {
    await db.adminImageAuditLog.create({
      data: {
        userId,
        model,
        promptLength,
        status,
        errorMessage: errorMessage ?? null,
      },
    });
  } catch (error) {
    log.warn(
      {
        error: error instanceof Error ? error.message : String(error),
        status,
        userId,
      },
      'Failed to write admin image audit log'
    );
  }
}
