import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the auth module
vi.mock('~/server/auth', () => ({
  auth: vi.fn(),
}));

// Mock the db module
vi.mock('~/server/db', () => ({
  db: {
    userPreferences: {},
  },
}));

describe('preferencesRouter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('get', () => {
    it('should return user preferences when they exist', async () => {
      const { preferencesRouter } = await import('./preferences');
      const { createMockContext, mockPrismaClient } = await import('~/test/mocks');

      const mockPreferences = {
        id: 'pref-1',
        userId: 'test-user-id',
        householdSize: 4,
        mealsPerDay: 2,
        days: 7,
        isVegetarian: true,
        isDairyFree: false,
        dislikes: 'mushrooms, olives',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaClient.userPreferences.findUnique.mockResolvedValue(mockPreferences);

      const ctx = createMockContext();
      const caller = preferencesRouter.createCaller(ctx);

      const result = await caller.get();

      expect(result).toEqual(mockPreferences);
      expect(mockPrismaClient.userPreferences.findUnique).toHaveBeenCalledWith({
        where: { userId: 'test-user-id' },
      });
    });

    it('should return default preferences when none exist', async () => {
      const { preferencesRouter } = await import('./preferences');
      const { createMockContext, mockPrismaClient } = await import('~/test/mocks');

      mockPrismaClient.userPreferences.findUnique.mockResolvedValue(null);

      const ctx = createMockContext();
      const caller = preferencesRouter.createCaller(ctx);

      const result = await caller.get();

      expect(result).toEqual({
        householdSize: 2,
        mealsPerDay: 1,
        days: 7,
        isVegetarian: false,
        isDairyFree: false,
        dislikes: '',
      });
    });

    it('should require authentication', async () => {
      const { preferencesRouter } = await import('./preferences');
      const { createMockPublicContext } = await import('~/test/mocks');

      const ctx = createMockPublicContext();
      const caller = preferencesRouter.createCaller(ctx);

      await expect(caller.get()).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update user preferences', async () => {
      const { preferencesRouter } = await import('./preferences');
      const { createMockContext, mockPrismaClient } = await import('~/test/mocks');

      const input = {
        householdSize: 4,
        mealsPerDay: 2,
        days: 5,
        isVegetarian: true,
        isDairyFree: false,
        dislikes: 'mushrooms',
      };

      const mockPreferences = {
        id: 'pref-1',
        userId: 'test-user-id',
        ...input,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaClient.userPreferences.upsert.mockResolvedValue(mockPreferences);

      const ctx = createMockContext();
      const caller = preferencesRouter.createCaller(ctx);

      const result = await caller.update(input);

      expect(result).toEqual(mockPreferences);
      expect(mockPrismaClient.userPreferences.upsert).toHaveBeenCalledWith({
        where: { userId: 'test-user-id' },
        create: {
          userId: 'test-user-id',
          ...input,
        },
        update: input,
      });
    });

    it('should validate household size minimum', async () => {
      const { preferencesRouter } = await import('./preferences');
      const { createMockContext } = await import('~/test/mocks');

      const ctx = createMockContext();
      const caller = preferencesRouter.createCaller(ctx);

      await expect(
        caller.update({
          householdSize: 0,
          mealsPerDay: 1,
          days: 7,
          isVegetarian: false,
          isDairyFree: false,
        })
      ).rejects.toThrow();
    });

    it('should validate household size maximum', async () => {
      const { preferencesRouter } = await import('./preferences');
      const { createMockContext } = await import('~/test/mocks');

      const ctx = createMockContext();
      const caller = preferencesRouter.createCaller(ctx);

      await expect(
        caller.update({
          householdSize: 11,
          mealsPerDay: 1,
          days: 7,
          isVegetarian: false,
          isDairyFree: false,
        })
      ).rejects.toThrow();
    });

    it('should validate meals per day range', async () => {
      const { preferencesRouter } = await import('./preferences');
      const { createMockContext } = await import('~/test/mocks');

      const ctx = createMockContext();
      const caller = preferencesRouter.createCaller(ctx);

      await expect(
        caller.update({
          householdSize: 2,
          mealsPerDay: 4,
          days: 7,
          isVegetarian: false,
          isDairyFree: false,
        })
      ).rejects.toThrow();
    });

    it('should validate days range', async () => {
      const { preferencesRouter } = await import('./preferences');
      const { createMockContext } = await import('~/test/mocks');

      const ctx = createMockContext();
      const caller = preferencesRouter.createCaller(ctx);

      await expect(
        caller.update({
          householdSize: 2,
          mealsPerDay: 1,
          days: 2,
          isVegetarian: false,
          isDairyFree: false,
        })
      ).rejects.toThrow();
    });

    it('should require authentication', async () => {
      const { preferencesRouter } = await import('./preferences');
      const { createMockPublicContext } = await import('~/test/mocks');

      const ctx = createMockPublicContext();
      const caller = preferencesRouter.createCaller(ctx);

      await expect(
        caller.update({
          householdSize: 2,
          mealsPerDay: 1,
          days: 7,
          isVegetarian: false,
          isDairyFree: false,
        })
      ).rejects.toThrow();
    });
  });
});
