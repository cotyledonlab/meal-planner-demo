import type { inferAsyncReturnType } from '@trpc/server';

export type CreateContextOptions = {
  sessionToken?: string | null;
};

export async function createContext(opts: CreateContextOptions = {}) {
  return {
    sessionToken: opts.sessionToken ?? null
  };
}

export type Context = inferAsyncReturnType<typeof createContext>;
