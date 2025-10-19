import { postRouter } from '~/server/api/routers/post';
import { preferencesRouter } from '~/server/api/routers/preferences';
import { mealPlanRouter } from '~/server/api/routers/mealPlan';
import { planRouter } from '~/server/api/routers/plan';
import { shoppingListRouter } from '~/server/api/routers/shoppingList';
import { createCallerFactory, createTRPCRouter } from '~/server/api/trpc';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  preferences: preferencesRouter,
  mealPlan: mealPlanRouter,
  plan: planRouter,
  shoppingList: shoppingListRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
