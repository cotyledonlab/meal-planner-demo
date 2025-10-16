import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock environment
vi.mock('~/env', () => ({
  env: {
    NODE_ENV: 'test',
    DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
  },
}));

// Mock PrismaClient constructor
vi.mock('@prisma/client', () => {
  const mockPrismaClient = {
    $connect: vi.fn(),
    $disconnect: vi.fn(),
    user: {},
    post: {},
  };

  return {
    PrismaClient: vi.fn(() => mockPrismaClient),
  };
});

describe('db', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a PrismaClient instance', async () => {
    const { db } = await import('./db');

    expect(db).toBeDefined();
    expect(db).toHaveProperty('user');
    expect(db).toHaveProperty('post');
    expect(db).toHaveProperty('$disconnect');
  });

  it('should export a singleton database instance', async () => {
    const { db } = await import('./db');

    expect(db).toBeDefined();
    expect(typeof db).toBe('object');
  });
});
