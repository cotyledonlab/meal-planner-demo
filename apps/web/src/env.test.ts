import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { z } from 'zod';

describe('Environment validation', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };
    // Set SKIP_ENV_VALIDATION to avoid validation during module import
    process.env.SKIP_ENV_VALIDATION = 'true';
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
    // Clear module cache to allow re-importing with different env vars
    vi.resetModules();
  });

  describe('DATABASE_URL validation', () => {
    // Shared schema for DATABASE_URL validation
    const databaseUrlSchema = z
      .string()
      .refine(
        (url) => url.startsWith('postgresql://') || url.startsWith('postgres://'),
        'DATABASE_URL must be a valid PostgreSQL connection string'
      );

    it('should accept valid PostgreSQL connection strings with postgresql:// prefix', () => {
      expect(() =>
        databaseUrlSchema.parse('postgresql://postgres:password@localhost:5432/database')
      ).not.toThrow();
    });

    it('should accept valid PostgreSQL connection strings with postgres:// prefix', () => {
      expect(() =>
        databaseUrlSchema.parse('postgres://postgres:password@localhost:5432/database')
      ).not.toThrow();
    });

    it('should accept PostgreSQL connection strings with special characters in password', () => {
      // Test with various special characters that might be in passwords
      expect(() =>
        databaseUrlSchema.parse('postgresql://postgres:p@ssw0rd!@localhost:5432/database')
      ).not.toThrow();
      expect(() =>
        databaseUrlSchema.parse('postgresql://postgres:vNcsJu$%^&*@localhost:5432/database')
      ).not.toThrow();
      expect(() =>
        databaseUrlSchema.parse('postgresql://postgres:p#ss@localhost:5432/database')
      ).not.toThrow();
    });

    it('should reject non-PostgreSQL connection strings', () => {
      expect(() => databaseUrlSchema.parse('mysql://localhost:3306/database')).toThrow();
      expect(() => databaseUrlSchema.parse('mongodb://localhost:27017/database')).toThrow();
      expect(() => databaseUrlSchema.parse('http://localhost:5432/database')).toThrow();
    });

    it('should reject empty strings', () => {
      expect(() => databaseUrlSchema.parse('')).toThrow();
    });

    it('should accept connection strings with URL-encoded passwords', () => {
      // URL-encoded special characters
      expect(() =>
        databaseUrlSchema.parse('postgresql://postgres:p%40ssw0rd@localhost:5432/database')
      ).not.toThrow();
      expect(() =>
        databaseUrlSchema.parse('postgresql://postgres:p%23ssw0rd@localhost:5432/database')
      ).not.toThrow();
    });
  });
});
