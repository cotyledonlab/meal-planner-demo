import { describe, it, expect } from 'vitest';

import { signUpSchema } from './schema';

const basePayload = {
  name: 'John Doe',
  email: 'john@example.com',
  password: 'Password123',
  confirmPassword: 'Password123',
};

describe('Sign Up Schema Validation', () => {
  describe('name validation', () => {
    it('accepts valid name', () => {
      const result = signUpSchema.safeParse({ ...basePayload, tier: 'basic' });
      expect(result.success).toBe(true);
    });

    it('rejects empty name', () => {
      const result = signUpSchema.safeParse({ ...basePayload, name: '', tier: 'basic' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe('Name is required');
      }
    });

    it('trims and rejects whitespace-only name', () => {
      const result = signUpSchema.safeParse({ ...basePayload, name: '   ', tier: 'basic' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe('Name is required');
      }
    });

    it('trims valid name with whitespace', () => {
      const result = signUpSchema.safeParse({
        ...basePayload,
        name: '  John Doe  ',
        tier: 'basic',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('John Doe');
      }
    });
  });

  describe('email validation', () => {
    it('accepts valid email', () => {
      const result = signUpSchema.safeParse({ ...basePayload, tier: 'basic' });
      expect(result.success).toBe(true);
    });

    it('rejects invalid email', () => {
      const result = signUpSchema.safeParse({
        ...basePayload,
        email: 'not-an-email',
        tier: 'basic',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('password validation', () => {
    it('accepts valid password', () => {
      const result = signUpSchema.safeParse({ ...basePayload, tier: 'basic' });
      expect(result.success).toBe(true);
    });

    it('rejects password without uppercase', () => {
      const result = signUpSchema.safeParse({
        ...basePayload,
        password: 'password123',
        tier: 'basic',
      });
      expect(result.success).toBe(false);
    });

    it('rejects password without number', () => {
      const result = signUpSchema.safeParse({
        ...basePayload,
        password: 'PasswordOnly',
        tier: 'basic',
      });
      expect(result.success).toBe(false);
    });

    it('rejects password shorter than 8 characters', () => {
      const result = signUpSchema.safeParse({
        ...basePayload,
        password: 'Pass1',
        confirmPassword: 'Pass1',
        tier: 'basic',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('password confirmation validation', () => {
    it('accepts matching passwords', () => {
      const result = signUpSchema.safeParse({
        ...basePayload,
        password: 'Password123',
        confirmPassword: 'Password123',
        tier: 'basic',
      });
      expect(result.success).toBe(true);
    });

    it('rejects mismatched passwords', () => {
      const result = signUpSchema.safeParse({
        ...basePayload,
        password: 'Password123',
        confirmPassword: 'DifferentPass1',
        tier: 'basic',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe('Passwords do not match');
      }
    });

    it('rejects empty confirm password', () => {
      const result = signUpSchema.safeParse({
        ...basePayload,
        confirmPassword: '',
        tier: 'basic',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe('Please confirm your password');
      }
    });

    it('rejects missing confirm password', () => {
      const { confirmPassword, ...payloadWithoutConfirm } = basePayload;
      void confirmPassword;
      const result = signUpSchema.safeParse({
        ...payloadWithoutConfirm,
        tier: 'basic',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('tier validation', () => {
    it('defaults to basic when omitted', () => {
      const result = signUpSchema.safeParse(basePayload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.tier).toBe('basic');
      }
    });

    it('accepts premium tier', () => {
      const result = signUpSchema.safeParse({ ...basePayload, tier: 'premium' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.tier).toBe('premium');
      }
    });

    it('rejects invalid tier values', () => {
      const result = signUpSchema.safeParse({ ...basePayload, tier: 'vip' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('Invalid enum value');
        expect(result.error.issues[0]?.message).toContain('vip');
      }
    });
  });
});
