import { PrismaAdapter } from '@auth/prisma-adapter';
import { type DefaultSession, type NextAuthConfig } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import DiscordProvider from 'next-auth/providers/discord';
import { verify } from '@node-rs/argon2';
import { z } from 'zod';

import { db } from '~/server/db';
import { env } from '~/env';

const normalizeAuthUrls = () => {
  const raw = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL;
  if (!raw) {
    return;
  }

  const hasScheme = /^[a-z][a-z\d+\-.]*:\/\//i.test(raw);
  if (hasScheme) {
    process.env.AUTH_URL ??= raw;
    process.env.NEXTAUTH_URL ??= raw;
    return;
  }

  const prefersHttp = /^(localhost|127\.|0\.0\.0\.0)/.test(raw);
  const normalized = `${prefersHttp ? 'http' : 'https'}://${raw}`;

  try {
    // Validate the normalized value so NextAuth receives a proper absolute URL.
    new URL(normalized);
    process.env.AUTH_URL = normalized;
    process.env.NEXTAUTH_URL = normalized;
  } catch (error) {
    console.warn('Unable to normalize AUTH_URL/NEXTAUTH_URL', { raw, error });
  }
};

normalizeAuthUrls();

process.env.AUTH_TRUST_HOST ??= 'true';

const normalizeAuthUrls = () => {
  const raw = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL;
  if (!raw) {
    return;
  }

  const hasScheme = /^[a-z][a-z\d+\-.]*:\/\//i.test(raw);
  if (hasScheme) {
    process.env.AUTH_URL ??= raw;
    process.env.NEXTAUTH_URL ??= raw;
    return;
  }

  const prefersHttp = /^(localhost|127\.|0\.0\.0\.0)/.test(raw);
  const normalized = `${prefersHttp ? 'http' : 'https'}://${raw}`;

  try {
    // Validate the normalized value so NextAuth receives a proper absolute URL.
    new URL(normalized);
    process.env.AUTH_URL = normalized;
    process.env.NEXTAUTH_URL = normalized;
  } catch (error) {
    console.warn('Unable to normalize AUTH_URL/NEXTAUTH_URL', { raw, error });
  }
};

normalizeAuthUrls();

process.env.AUTH_TRUST_HOST ??= 'true';

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession['user'];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  secret: env.AUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: 'Email & Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = signInSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const { email, password } = parsed.data;

        const user = await db.user.findUnique({
          where: { email },
          include: { password: true },
        });

        if (!user?.password?.hash) {
          return null;
        }

        const isValid = await verify(user.password.hash, password, {
          memoryCost: 19456,
          timeCost: 2,
          outputLen: 32,
          parallelism: 1,
        });

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
    DiscordProvider,
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
  adapter: PrismaAdapter(db),
  session: {
    strategy: 'jwt',
  },
  trustHost: true,
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.id as string,
      },
    }),
  },
} satisfies NextAuthConfig;
