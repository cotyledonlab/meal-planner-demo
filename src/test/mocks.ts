import { vi } from 'vitest';

// Mock Prisma Client
export const mockPrismaClient: any = {
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
  $disconnect: vi.fn(),
  $connect: vi.fn(),
  $executeRaw: vi.fn(),
  $executeRawUnsafe: vi.fn(),
  $queryRaw: vi.fn(),
  $queryRawUnsafe: vi.fn(),
  $transaction: vi.fn(),
  $on: vi.fn(),
};

// Mock NextAuth session
export const mockSession = {
  user: {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    image: null,
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

// Mock tRPC context
export const createMockContext = (overrides = {}): any => ({
  db: mockPrismaClient,
  session: mockSession,
  headers: new Headers(),
  ...overrides,
});

// Mock tRPC context without session (for public procedures)
export const createMockPublicContext = (overrides = {}): any => ({
  db: mockPrismaClient,
  session: null,
  headers: new Headers(),
  ...overrides,
});
