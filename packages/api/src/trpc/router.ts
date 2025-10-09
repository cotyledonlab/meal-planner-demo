import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import type { Context } from './context';

const t = initTRPC.context<Context>().create();

export const appRouter = t.router({
  health: t.procedure.query(() => ({
    status: 'ok',
    timestamp: new Date().toISOString()
  })),
  echo: t.procedure.input(z.object({ message: z.string().min(1) })).query(({ input }) => ({
    message: input.message
  }))
});

export type AppRouter = typeof appRouter;
