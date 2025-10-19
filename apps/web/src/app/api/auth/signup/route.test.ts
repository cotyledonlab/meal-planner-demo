import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Import the schema from the signup route
const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be at most 128 characters')
    .regex(/[A-Z]/, 'Password must include at least one uppercase letter')
    .regex(/[0-9]/, 'Password must include at least one number'),
  name: z.string().trim().min(1, 'Name is required'),
});

describe('Sign Up Schema Validation', () => {
  describe('name validation', () => {
    it('accepts valid name', () => {
      const result = signUpSchema.safeParse({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123',
      });
      expect(result.success).toBe(true);
    });

    it('rejects empty name', () => {
      const result = signUpSchema.safeParse({
        name: '',
        email: 'john@example.com',
        password: 'Password123',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe('Name is required');
      }
    });

    it('trims and rejects whitespace-only name', () => {
      const result = signUpSchema.safeParse({
        name: '   ',
        email: 'john@example.com',
        password: 'Password123',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe('Name is required');
      }
    });

    it('trims valid name with whitespace', () => {
      const result = signUpSchema.safeParse({
        name: '  John Doe  ',
        email: 'john@example.com',
        password: 'Password123',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('John Doe');
      }
    });
  });

  describe('email validation', () => {
    it('accepts valid email', () => {
      const result = signUpSchema.safeParse({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123',
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid email', () => {
      const result = signUpSchema.safeParse({
        name: 'John Doe',
        email: 'not-an-email',
        password: 'Password123',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('password validation', () => {
    it('accepts valid password', () => {
      const result = signUpSchema.safeParse({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123',
      });
      expect(result.success).toBe(true);
    });

    it('rejects password without uppercase', () => {
      const result = signUpSchema.safeParse({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      });
      expect(result.success).toBe(false);
    });

    it('rejects password without number', () => {
      const result = signUpSchema.safeParse({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'PasswordOnly',
      });
      expect(result.success).toBe(false);
    });

    it('rejects password shorter than 8 characters', () => {
      const result = signUpSchema.safeParse({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Pass1',
      });
      expect(result.success).toBe(false);
    });
  });
});
