import { describe, it, expect, vi } from 'vitest';

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

describe('appRouter', () => {
  it('should contain post router', async () => {
    const { appRouter } = await import('./root');
    
    expect(appRouter._def.procedures).toHaveProperty('post.hello');
    expect(appRouter._def.procedures).toHaveProperty('post.create');
    expect(appRouter._def.procedures).toHaveProperty('post.getLatest');
    expect(appRouter._def.procedures).toHaveProperty('post.getSecretMessage');
  });

  it('should create a caller factory', async () => {
    const { createCaller } = await import('./root');
    
    expect(createCaller).toBeDefined();
    expect(typeof createCaller).toBe('function');
  });
});
