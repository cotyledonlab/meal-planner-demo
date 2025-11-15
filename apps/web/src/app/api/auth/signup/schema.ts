import { z } from 'zod';

export const signupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  tier: z.enum(['free', 'premium']).default('free'),
});

export type SignupInput = z.infer<typeof signupSchema>;
