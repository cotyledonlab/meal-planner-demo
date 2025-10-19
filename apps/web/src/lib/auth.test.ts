import { describe, it, expect } from 'vitest';
import { isPremiumUser, isAuthenticatedUser } from './auth';

describe('Auth Utilities', () => {
  describe('isPremiumUser', () => {
    it('returns true for premium users', () => {
      expect(isPremiumUser({ role: 'premium' })).toBe(true);
    });

    it('returns false for basic users', () => {
      expect(isPremiumUser({ role: 'basic' })).toBe(false);
    });

    it('returns false for null user', () => {
      expect(isPremiumUser(null)).toBe(false);
    });

    it('returns false for undefined user', () => {
      expect(isPremiumUser(undefined)).toBe(false);
    });

    it('returns false for user with null role', () => {
      expect(isPremiumUser({ role: null })).toBe(false);
    });

    it('returns false for user with undefined role', () => {
      expect(isPremiumUser({ role: undefined })).toBe(false);
    });
  });

  describe('isAuthenticatedUser', () => {
    it('returns true for user with role', () => {
      expect(isAuthenticatedUser({ role: 'basic' })).toBe(true);
      expect(isAuthenticatedUser({ role: 'premium' })).toBe(true);
    });

    it('returns true for user object even without role', () => {
      expect(isAuthenticatedUser({})).toBe(true);
    });

    it('returns false for null user', () => {
      expect(isAuthenticatedUser(null)).toBe(false);
    });

    it('returns false for undefined user', () => {
      expect(isAuthenticatedUser(undefined)).toBe(false);
    });
  });
});
