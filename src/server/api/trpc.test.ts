import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createTRPCContext } from './trpc';

// Mock the auth module
vi.mock('~/server/auth', () => ({
  auth: vi.fn(),
}));

// Mock the db module
vi.mock('~/server/db', () => ({
  db: {
    post: {},
    user: {},
  },
}));

describe('tRPC Context', () => {
  describe('createTRPCContext', () => {
    it('should create context with headers and session', async () => {
      const { auth } = await import('~/server/auth');
      const mockSession = {
        user: { id: 'test-id', email: 'test@example.com', name: 'Test', image: null },
        expires: new Date().toISOString(),
      } as any;
      vi.mocked(auth).mockResolvedValue(mockSession);

      const headers = new Headers();
      const ctx = await createTRPCContext({ headers });

      expect(ctx).toHaveProperty('db');
      expect(ctx).toHaveProperty('session');
      expect(ctx).toHaveProperty('headers');
      expect(ctx.session).toEqual(mockSession);
      expect(ctx.headers).toBe(headers);
    });

    it('should create context with null session when not authenticated', async () => {
      const { auth } = await import('~/server/auth');
      vi.mocked(auth).mockResolvedValue(null as any);

      const headers = new Headers();
      const ctx = await createTRPCContext({ headers });

      expect(ctx.session).toBeNull();
    });
  });
});
