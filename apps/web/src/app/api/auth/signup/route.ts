import { hash } from '@node-rs/argon2';
import { NextResponse } from 'next/server';

import { db } from '~/server/db';
import { signIn } from '~/server/auth';

import { signUpSchema } from './schema';

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

    const { email, password, name, tier } = parsed.data;
    const role = tier === 'premium' ? 'premium' : 'basic';

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
        role,
        password: {
          create: {
            hash: passwordHash,
          },
        },
      },
    });

    // Sign in the user to create a session, avoiding need to resend password
    await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Sign-up error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
