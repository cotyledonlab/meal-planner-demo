import { describe, it, expect, beforeEach, vi } from 'vitest';

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

describe('postRouter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('hello', () => {
    it('should return a greeting with the provided text', async () => {
      const { postRouter } = await import('./post');
      const { createMockPublicContext } = await import('~/test/mocks');

      const ctx = createMockPublicContext();
      const caller = postRouter.createCaller(ctx);

      const result = await caller.hello({ text: 'World' });

      expect(result).toEqual({
        greeting: 'Hello World',
      });
    });

    it('should handle empty string input', async () => {
      const { postRouter } = await import('./post');
      const { createMockPublicContext } = await import('~/test/mocks');

      const ctx = createMockPublicContext();
      const caller = postRouter.createCaller(ctx);

      const result = await caller.hello({ text: '' });

      expect(result).toEqual({
        greeting: 'Hello ',
      });
    });

    it('should handle special characters in input', async () => {
      const { postRouter } = await import('./post');
      const { createMockPublicContext } = await import('~/test/mocks');

      const ctx = createMockPublicContext();
      const caller = postRouter.createCaller(ctx);

      const result = await caller.hello({ text: 'Test 123 !@#' });

      expect(result).toEqual({
        greeting: 'Hello Test 123 !@#',
      });
    });
  });

  describe('create', () => {
    it('should create a post with valid input', async () => {
      const { postRouter } = await import('./post');
      const { createMockContext, mockPrismaClient } = await import('~/test/mocks');

      const mockPost = {
        id: 1,
        name: 'Test Post',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdById: 'test-user-id',
      };

      mockPrismaClient.post.create.mockResolvedValue(mockPost);

      const ctx = createMockContext();
      const caller = postRouter.createCaller(ctx);

      const result = await caller.create({ name: 'Test Post' });

      expect(result).toEqual(mockPost);
      expect(mockPrismaClient.post.create).toHaveBeenCalledWith({
        data: {
          name: 'Test Post',
          createdBy: { connect: { id: 'test-user-id' } },
        },
      });
    });

    it('should require authentication', async () => {
      const { postRouter } = await import('./post');
      const { createMockPublicContext } = await import('~/test/mocks');

      const ctx = createMockPublicContext();
      const caller = postRouter.createCaller(ctx);

      await expect(caller.create({ name: 'Test Post' })).rejects.toThrow();
    });

    it('should validate input name is not empty', async () => {
      const { postRouter } = await import('./post');
      const { createMockContext } = await import('~/test/mocks');

      const ctx = createMockContext();
      const caller = postRouter.createCaller(ctx);

      await expect(caller.create({ name: '' })).rejects.toThrow();
    });
  });

  describe('getLatest', () => {
    it('should return the latest post for the authenticated user', async () => {
      const { postRouter } = await import('./post');
      const { createMockContext, mockPrismaClient } = await import('~/test/mocks');

      const mockPost = {
        id: 1,
        name: 'Latest Post',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdById: 'test-user-id',
      };

      mockPrismaClient.post.findFirst.mockResolvedValue(mockPost);

      const ctx = createMockContext();
      const caller = postRouter.createCaller(ctx);

      const result = await caller.getLatest();

      expect(result).toEqual(mockPost);
      expect(mockPrismaClient.post.findFirst).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
        where: { createdBy: { id: 'test-user-id' } },
      });
    });

    it('should return null when no posts exist', async () => {
      const { postRouter } = await import('./post');
      const { createMockContext, mockPrismaClient } = await import('~/test/mocks');

      mockPrismaClient.post.findFirst.mockResolvedValue(null);

      const ctx = createMockContext();
      const caller = postRouter.createCaller(ctx);

      const result = await caller.getLatest();

      expect(result).toBeNull();
    });

    it('should require authentication', async () => {
      const { postRouter } = await import('./post');
      const { createMockPublicContext } = await import('~/test/mocks');

      const ctx = createMockPublicContext();
      const caller = postRouter.createCaller(ctx);

      await expect(caller.getLatest()).rejects.toThrow();
    });
  });

  describe('getSecretMessage', () => {
    it('should return secret message for authenticated users', async () => {
      const { postRouter } = await import('./post');
      const { createMockContext } = await import('~/test/mocks');

      const ctx = createMockContext();
      const caller = postRouter.createCaller(ctx);

      const result = await caller.getSecretMessage();

      expect(result).toBe('you can now see this secret message!');
    });

    it('should require authentication', async () => {
      const { postRouter } = await import('./post');
      const { createMockPublicContext } = await import('~/test/mocks');

      const ctx = createMockPublicContext();
      const caller = postRouter.createCaller(ctx);

      await expect(caller.getSecretMessage()).rejects.toThrow();
    });
  });
});
