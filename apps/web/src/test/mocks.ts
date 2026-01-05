import type { PrismaClient } from '@prisma/client';
import { vi } from 'vitest';

export const mockPrismaClient = {
  post: {
    create: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  user: {
    create: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  userPreferences: {
    findUnique: vi.fn(),
    upsert: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  recipe: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
  },
  ingredient: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
  },
  mealPlan: {
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
  },
  mealPlanItem: {
    update: vi.fn(),
    create: vi.fn(),
    findMany: vi.fn(),
  },
  pantryItem: {
    findMany: vi.fn(),
  },
  priceBaseline: {
    findMany: vi.fn(),
  },
  shoppingList: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
  shoppingListItem: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
  },
  $disconnect: vi.fn(),
  $connect: vi.fn(),
  $executeRaw: vi.fn(),
  $executeRawUnsafe: vi.fn(),
  $queryRaw: vi.fn(),
  $queryRawUnsafe: vi.fn(),
  $transaction: vi.fn(),
  $on: vi.fn(),
} as const;

// Mock NextAuth session (default: free user)
export const mockSession = {
  user: {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    image: null,
    role: 'user',
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

// Mock premium user session
export const mockPremiumSession = {
  user: {
    id: 'test-user-id',
    email: 'premium@example.com',
    name: 'Premium User',
    image: null,
    role: 'premium',
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

// Mock tRPC context
export const createMockContext = (overrides: Record<string, unknown> = {}) => ({
  db: mockPrismaClient as unknown as PrismaClient,
  session: mockSession,
  headers: new Headers(),
  ...overrides,
});

// Mock tRPC context without session (for public procedures)
export const createMockPublicContext = (overrides: Record<string, unknown> = {}) => ({
  db: mockPrismaClient as unknown as PrismaClient,
  session: null,
  headers: new Headers(),
  ...overrides,
});

// Mock tRPC context for premium users
export const createMockPremiumContext = (overrides: Record<string, unknown> = {}) => ({
  db: mockPrismaClient as unknown as PrismaClient,
  session: mockPremiumSession,
  headers: new Headers(),
  ...overrides,
});
