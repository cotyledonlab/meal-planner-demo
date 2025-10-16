import { hash } from '@node-rs/argon2';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { db } from '~/server/db';

const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be at most 128 characters')
    .regex(/[A-Z]/, 'Password must include at least one uppercase letter')
    .regex(/[0-9]/, 'Password must include at least one number'),
  name: z.string().min(1, 'Name is required').optional(),
});

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = signUpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { email, password, name } = parsed.data;

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    // Hash password with argon2id
    const passwordHash = await hash(password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });

    // Create user and password in a transaction
    const user = await db.user.create({
      data: {
        email,
        name: name ?? null,
        password: {
          create: {
            hash: passwordHash,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Sign-up error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
