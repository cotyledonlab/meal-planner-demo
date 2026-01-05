import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import type { Prisma, PrismaClient } from '@prisma/client';

import { createTRPCRouter, adminProcedure } from '~/server/api/trpc';
import { GeminiRecipeClient, isGeminiRecipeConfigured } from '~/server/services/geminiRecipe';
import { createLogger } from '~/lib/logger';
import { deriveRecipeTags } from '~/lib/ingredients/derivation';

const log = createLogger('admin-recipe-router');

const mealTypeSchema = z.enum(['breakfast', 'lunch', 'dinner']);
const difficultySchema = z.enum(['EASY', 'MEDIUM', 'HARD']);
const stepTypeSchema = z.enum(['PREP', 'COOK', 'REST', 'ASSEMBLE']);

const promptParamsSchema = z.object({
  cuisine: z.string().min(2).max(60).optional().nullable(),
  mealTypes: z.array(mealTypeSchema).min(1),
  difficulty: difficultySchema,
  servingsDefault: z.number().int().min(1).max(12),
  totalTimeMinutes: z.number().int().min(5).max(480),
  includeIngredients: z.array(z.string().min(1).max(80)).default([]),
  avoidIngredients: z.array(z.string().min(1).max(80)).default([]),
  dietTags: z.array(z.string().min(2).max(30)).default([]),
  allergenTags: z.array(z.string().min(2).max(30)).default([]),
});

const recipeDraftSchema = z
  .object({
    title: z.string().min(4).max(120),
    description: z.string().min(10).max(280),
    servingsDefault: z.number().int().min(1).max(12),
    prepTimeMinutes: z.number().int().min(0).max(240),
    cookTimeMinutes: z.number().int().min(0).max(360),
    totalTimeMinutes: z.number().int().min(5).max(480),
    calories: z.number().int().min(50).max(2000),
    difficulty: difficultySchema,
    mealTypes: z.array(mealTypeSchema).min(1),
    ingredients: z
      .array(
        z.object({
          name: z.string().min(2).max(80),
          quantity: z.number().positive().max(5000),
          unit: z.string().min(1).max(20),
          notes: z.string().max(120).optional(),
        })
      )
      .min(5),
    steps: z
      .array(
        z.object({
          instruction: z.string().min(6).max(600),
          stepType: stepTypeSchema.optional(),
          durationMinutes: z.number().int().min(0).max(240).optional(),
          tips: z.string().max(280).optional(),
        })
      )
      .min(3),
    nutrition: z
      .object({
        calories: z.number().int().min(50).max(2000),
        protein: z.number().min(0).max(150),
        carbohydrates: z.number().min(0).max(300),
        fat: z.number().min(0).max(150),
        fiber: z.number().min(0).max(80).optional(),
        sugar: z.number().min(0).max(150).optional(),
        sodium: z.number().min(0).max(4000).optional(),
      })
      .optional(),
    dietTags: z.array(z.string().min(2).max(30)).optional(),
    allergenTags: z.array(z.string().min(2).max(30)).optional(),
    sourcePrompt: z.string().min(10).max(1200).optional(),
    image: z
      .object({
        url: z.string().url(),
        prompt: z.string().max(400).optional(),
        model: z.string().max(80).optional(),
        altText: z.string().max(120).optional(),
      })
      .optional(),
  })
  .strict();

const recipeDraftResponseSchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'title',
    'description',
    'servingsDefault',
    'prepTimeMinutes',
    'cookTimeMinutes',
    'totalTimeMinutes',
    'calories',
    'difficulty',
    'mealTypes',
    'ingredients',
    'steps',
  ],
  properties: {
    title: { type: 'string' },
    description: { type: 'string' },
    servingsDefault: { type: 'integer', minimum: 1 },
    prepTimeMinutes: { type: 'integer', minimum: 0 },
    cookTimeMinutes: { type: 'integer', minimum: 0 },
    totalTimeMinutes: { type: 'integer', minimum: 5 },
    calories: { type: 'integer', minimum: 50 },
    difficulty: { type: 'string', enum: ['EASY', 'MEDIUM', 'HARD'] },
    mealTypes: {
      type: 'array',
      items: { type: 'string', enum: ['breakfast', 'lunch', 'dinner'] },
      minItems: 1,
    },
    ingredients: {
      type: 'array',
      minItems: 5,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['name', 'quantity', 'unit'],
        properties: {
          name: { type: 'string' },
          quantity: { type: 'number', minimum: 0 },
          unit: { type: 'string' },
          notes: { type: 'string' },
        },
      },
    },
    steps: {
      type: 'array',
      minItems: 3,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['instruction'],
        properties: {
          instruction: { type: 'string' },
          stepType: { type: 'string', enum: ['PREP', 'COOK', 'REST', 'ASSEMBLE'] },
          durationMinutes: { type: 'integer', minimum: 0 },
          tips: { type: 'string' },
        },
      },
    },
    nutrition: {
      type: 'object',
      additionalProperties: false,
      required: ['calories', 'protein', 'carbohydrates', 'fat'],
      properties: {
        calories: { type: 'integer', minimum: 50 },
        protein: { type: 'number', minimum: 0 },
        carbohydrates: { type: 'number', minimum: 0 },
        fat: { type: 'number', minimum: 0 },
        fiber: { type: 'number', minimum: 0 },
        sugar: { type: 'number', minimum: 0 },
        sodium: { type: 'number', minimum: 0 },
      },
    },
    dietTags: {
      type: 'array',
      items: { type: 'string' },
    },
    allergenTags: {
      type: 'array',
      items: { type: 'string' },
    },
  },
} as const;

const saveDraftSchema = recipeDraftSchema.extend({
  id: z.string().optional(),
  image: z.object({
    url: z.string().url(),
    prompt: z.string().max(400).optional(),
    model: z.string().max(80).optional(),
    altText: z.string().max(120).optional(),
  }),
});

const listFiltersSchema = z
  .object({
    status: z.enum(['DRAFT', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'ARCHIVED']).optional(),
    search: z.string().min(1).max(120).optional(),
    limit: z.number().int().min(1).max(100).default(50),
  })
  .default({ limit: 50 });

type ResolvedIngredient = {
  ingredientId: string;
  canonicalIngredient: {
    name: string;
    category: string;
    isVegan?: boolean;
    isVegetarian?: boolean;
    isGlutenFree?: boolean;
    isDairyFree?: boolean;
    containsGluten?: boolean;
    containsDairy?: boolean;
    containsEggs?: boolean;
    containsNuts?: boolean;
    containsPeanuts?: boolean;
    containsSoy?: boolean;
    containsShellfish?: boolean;
    containsFish?: boolean;
    containsSesame?: boolean;
  } | null;
  displayName: string;
};

function extractJsonPayload(text: string): string {
  const trimmed = text.trim();
  const fencedMatch = /```(?:json)?\s*([\s\S]*?)\s*```/i.exec(trimmed);
  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim();
  }
  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace >= 0 && lastBrace >= firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }
  return trimmed;
}

function normalizeIngredientName(name: string): string {
  return name.trim().toLowerCase();
}

async function resolveIngredient(
  ctx: { db: PrismaClient },
  name: string
): Promise<ResolvedIngredient> {
  const normalized = normalizeIngredientName(name);

  const existing = await ctx.db.ingredient.findFirst({
    where: { name: { equals: normalized, mode: 'insensitive' } },
    include: { canonicalIngredient: true },
  });
  if (existing) {
    return {
      ingredientId: existing.id,
      canonicalIngredient: existing.canonicalIngredient,
      displayName: existing.name,
    };
  }

  const alias = await ctx.db.ingredientAlias.findFirst({
    where: { alias: { equals: normalized, mode: 'insensitive' } },
    include: { canonicalIngredient: true },
  });

  if (alias?.canonicalIngredient) {
    const linked = await ctx.db.ingredient.findFirst({
      where: { canonicalIngredientId: alias.canonicalIngredientId },
      include: { canonicalIngredient: true },
    });
    if (linked) {
      return {
        ingredientId: linked.id,
        canonicalIngredient: linked.canonicalIngredient,
        displayName: linked.name,
      };
    }

    const created = await ctx.db.ingredient.create({
      data: {
        name: alias.canonicalIngredient.name,
        category: alias.canonicalIngredient.category,
        canonicalIngredientId: alias.canonicalIngredientId,
      },
      include: { canonicalIngredient: true },
    });

    return {
      ingredientId: created.id,
      canonicalIngredient: created.canonicalIngredient,
      displayName: created.name,
    };
  }

  const canonical = await ctx.db.canonicalIngredient.findFirst({
    where: { name: { equals: normalized, mode: 'insensitive' } },
  });

  if (canonical) {
    const linked = await ctx.db.ingredient.findFirst({
      where: { canonicalIngredientId: canonical.id },
      include: { canonicalIngredient: true },
    });
    if (linked) {
      return {
        ingredientId: linked.id,
        canonicalIngredient: linked.canonicalIngredient,
        displayName: linked.name,
      };
    }

    const created = await ctx.db.ingredient.create({
      data: {
        name: canonical.name,
        category: canonical.category,
        canonicalIngredientId: canonical.id,
      },
      include: { canonicalIngredient: true },
    });

    return {
      ingredientId: created.id,
      canonicalIngredient: created.canonicalIngredient,
      displayName: created.name,
    };
  }

  const created = await ctx.db.ingredient.create({
    data: {
      name: name.trim(),
      category: 'pantry',
    },
    include: { canonicalIngredient: true },
  });

  return {
    ingredientId: created.id,
    canonicalIngredient: created.canonicalIngredient,
    displayName: created.name,
  };
}

async function resolveDietTags(ctx: { db: PrismaClient }, tagNames: string[]) {
  if (tagNames.length === 0) return [];
  const existing = await ctx.db.dietTag.findMany({
    where: { name: { in: tagNames } },
  });
  const existingNames = new Set(existing.map((tag) => tag.name));
  const missing = tagNames.filter((name) => !existingNames.has(name));

  if (missing.length > 0) {
    await ctx.db.dietTag.createMany({
      data: missing.map((name) => ({ name })),
      skipDuplicates: true,
    });
  }

  return ctx.db.dietTag.findMany({ where: { name: { in: tagNames } } });
}

async function resolveAllergenTags(ctx: { db: PrismaClient }, tagNames: string[]) {
  if (tagNames.length === 0) return [];
  const existing = await ctx.db.allergenTag.findMany({
    where: { name: { in: tagNames } },
  });
  const existingNames = new Set(existing.map((tag) => tag.name));
  const missing = tagNames.filter((name) => !existingNames.has(name));

  if (missing.length > 0) {
    await ctx.db.allergenTag.createMany({
      data: missing.map((name) => ({ name })),
      skipDuplicates: true,
    });
  }

  return ctx.db.allergenTag.findMany({ where: { name: { in: tagNames } } });
}

function buildPrompt(input: z.infer<typeof promptParamsSchema>) {
  const cuisineLine = input.cuisine ? `Cuisine: ${input.cuisine}` : 'Cuisine: chef choice';
  const include = input.includeIngredients.length
    ? `Must include: ${input.includeIngredients.join(', ')}`
    : 'Must include: (none)';
  const avoid = input.avoidIngredients.length
    ? `Avoid: ${input.avoidIngredients.join(', ')}`
    : 'Avoid: (none)';
  const dietTags = input.dietTags.length ? `Diet tags: ${input.dietTags.join(', ')}` : '';
  const allergenTags = input.allergenTags.length
    ? `Allergen tags to avoid: ${input.allergenTags.join(', ')}`
    : '';

  return [
    'You are a professional recipe developer.',
    'Return JSON only. Do not include markdown or explanations.',
    'Schema keys must match exactly and include calories at the top level.',
    '',
    cuisineLine,
    `Meal types: ${input.mealTypes.join(', ')}`,
    `Difficulty: ${input.difficulty}`,
    `Servings: ${input.servingsDefault}`,
    `Total time minutes: ${input.totalTimeMinutes}`,
    include,
    avoid,
    dietTags,
    allergenTags,
    '',
    'Return JSON with this shape:',
    '{',
    '  "title": string,',
    '  "description": string,',
    '  "servingsDefault": number,',
    '  "prepTimeMinutes": number,',
    '  "cookTimeMinutes": number,',
    '  "totalTimeMinutes": number,',
    '  "calories": number,',
    '  "difficulty": "EASY" | "MEDIUM" | "HARD",',
    '  "mealTypes": ["breakfast" | "lunch" | "dinner"],',
    '  "ingredients": [{"name": string, "quantity": number, "unit": string, "notes"?: string}],',
    '  "steps": [{"instruction": string, "stepType"?: "PREP" | "COOK" | "REST" | "ASSEMBLE", "durationMinutes"?: number, "tips"?: string}],',
    '  "nutrition"?: {"calories": number, "protein": number, "carbohydrates": number, "fat": number, "fiber"?: number, "sugar"?: number, "sodium"?: number},',
    '  "dietTags"?: string[],',
    '  "allergenTags"?: string[]',
    '}',
  ]
    .filter(Boolean)
    .join('\n');
}

export const adminRecipeRouter = createTRPCRouter({
  list: adminProcedure.input(listFiltersSchema).query(async ({ ctx, input }) => {
    const filters = input;
    const where: Record<string, unknown> = {};
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.search) {
      where.title = { contains: filters.search, mode: 'insensitive' };
    }

    return ctx.db.recipe.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      take: filters.limit ?? 50,
      select: {
        id: true,
        title: true,
        status: true,
        mealTypes: true,
        updatedAt: true,
        createdAt: true,
      },
    });
  }),

  get: adminProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    const recipe = await ctx.db.recipe.findUnique({
      where: { id: input.id },
      include: {
        ingredients: { include: { ingredient: true } },
        steps: { orderBy: { stepNumber: 'asc' } },
        nutrition: true,
        images: true,
        dietTags: { include: { dietTag: true } },
        allergenTags: { include: { allergenTag: true } },
      },
    });

    if (!recipe) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Recipe not found' });
    }

    return recipe;
  }),

  generateDraft: adminProcedure.input(promptParamsSchema).mutation(async ({ input }) => {
    if (!isGeminiRecipeConfigured()) {
      throw new TRPCError({
        code: 'PRECONDITION_FAILED',
        message: 'Gemini API is not configured. Set GEMINI_API_KEY to enable generation.',
      });
    }

    const prompt = buildPrompt(input);
    const gemini = new GeminiRecipeClient();

    try {
      const text = await gemini.generateText({
        prompt,
        responseSchema: recipeDraftResponseSchema,
      });
      const jsonPayload = extractJsonPayload(text);
      const parsed: unknown = JSON.parse(jsonPayload);
      const validated = recipeDraftSchema.parse(parsed);
      return { ...validated, sourcePrompt: prompt };
    } catch (error) {
      log.error({ error }, 'Failed to generate recipe draft');
      if (error instanceof TRPCError) {
        throw error;
      }
      if (error instanceof SyntaxError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'AI response was not valid JSON',
          cause: error,
        });
      }
      if (error instanceof z.ZodError) {
        throw new TRPCError({
          code: 'UNPROCESSABLE_CONTENT',
          message: 'AI response did not match the recipe schema',
          cause: error,
        });
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error instanceof Error ? error.message : 'Failed to generate recipe draft',
        cause: error instanceof Error ? error : undefined,
      });
    }
  }),

  saveDraft: adminProcedure.input(saveDraftSchema).mutation(async ({ ctx, input }) => {
    const ingredientsResolved = await Promise.all(
      input.ingredients.map((ingredient) => resolveIngredient(ctx, ingredient.name))
    );

    const derivedTags = deriveRecipeTags(
      ingredientsResolved.map((ingredient) => ({
        name: ingredient.displayName,
        canonicalIngredient: ingredient.canonicalIngredient,
      }))
    );

    const dietTagNames = Array.from(
      new Set([...(input.dietTags ?? []), ...derivedTags.dietTags])
    );
    const allergenTagNames = Array.from(
      new Set([...(input.allergenTags ?? []), ...derivedTags.allergenTags])
    );

    const [dietTags, allergenTags] = await Promise.all([
      resolveDietTags(ctx, dietTagNames),
      resolveAllergenTags(ctx, allergenTagNames),
    ]);

    const existingRecipe = input.id
      ? await ctx.db.recipe.findUnique({ where: { id: input.id }, select: { status: true } })
      : null;

    const recipeData = {
      title: input.title,
      description: input.description,
      servingsDefault: input.servingsDefault,
      prepTimeMinutes: input.prepTimeMinutes,
      cookTimeMinutes: input.cookTimeMinutes,
      totalTimeMinutes: input.totalTimeMinutes,
      calories: input.calories,
      difficulty: input.difficulty,
      mealTypes: input.mealTypes,
      status: existingRecipe?.status ?? 'DRAFT',
      instructionsMd: null,
    };

    const result = await ctx.db.$transaction(async (tx: Prisma.TransactionClient) => {
      let recipeId = input.id;

      if (!recipeId) {
        const created = await tx.recipe.create({
          data: recipeData,
          select: { id: true },
        });
        recipeId = created.id;
      } else {
        await tx.recipe.update({
          where: { id: recipeId },
          data: recipeData,
        });

        await Promise.all([
          tx.recipeIngredient.deleteMany({ where: { recipeId } }),
          tx.recipeStep.deleteMany({ where: { recipeId } }),
          tx.recipeNutrition.deleteMany({ where: { recipeId } }),
          tx.recipeDietTag.deleteMany({ where: { recipeId } }),
          tx.recipeAllergenTag.deleteMany({ where: { recipeId } }),
          tx.recipeImage.deleteMany({ where: { recipeId } }),
        ]);
      }

      await tx.recipeStep.createMany({
        data: input.steps.map((step, index) => ({
          recipeId,
          stepNumber: index + 1,
          stepType: step.stepType ?? 'COOK',
          instruction: step.instruction,
          durationMinutes: step.durationMinutes,
          tips: step.tips,
        })),
      });

      const ingredientRows = input.ingredients.map((ingredient, index) => {
        const resolved = ingredientsResolved[index];
        if (!resolved) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Ingredient resolution mismatch. Please retry saving the draft.',
          });
        }

        return {
          recipeId,
          ingredientId: resolved.ingredientId,
          quantity: ingredient.quantity,
          unit: ingredient.unit,
        };
      });

      await tx.recipeIngredient.createMany({ data: ingredientRows });

      if (input.nutrition) {
        await tx.recipeNutrition.create({
          data: {
            recipeId,
            calories: input.nutrition.calories,
            protein: input.nutrition.protein,
            carbohydrates: input.nutrition.carbohydrates,
            fat: input.nutrition.fat,
            fiber: input.nutrition.fiber,
            sugar: input.nutrition.sugar,
            sodium: input.nutrition.sodium,
          },
        });
      }

      await tx.recipeImage.create({
        data: {
          recipeId,
          url: input.image.url,
          prompt: input.image.prompt ?? null,
          model: input.image.model ?? null,
          altText: input.image.altText ?? null,
          isPrimary: true,
        },
      });

      if (dietTags.length > 0) {
        await tx.recipeDietTag.createMany({
          data: dietTags.map((tag) => ({
            recipeId,
            dietTagId: tag.id,
          })),
          skipDuplicates: true,
        });
      }

      if (allergenTags.length > 0) {
        await tx.recipeAllergenTag.createMany({
          data: allergenTags.map((tag) => ({
            recipeId,
            allergenTagId: tag.id,
          })),
          skipDuplicates: true,
        });
      }

      return tx.recipe.findUnique({
        where: { id: recipeId },
        include: {
          ingredients: { include: { ingredient: true } },
          steps: { orderBy: { stepNumber: 'asc' } },
          nutrition: true,
          images: true,
          dietTags: { include: { dietTag: true } },
          allergenTags: { include: { allergenTag: true } },
        },
      });
    });

    return result;
  }),

  publish: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const recipe = await ctx.db.recipe.findUnique({
        where: { id: input.id },
      });

      if (!recipe) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Recipe not found' });
      }
      if (recipe.status !== 'DRAFT') {
        throw new TRPCError({ code: 'CONFLICT', message: 'Recipe is not in draft status' });
      }

      const updated = await ctx.db.$transaction(async (tx: Prisma.TransactionClient) => {
        const updatedRecipe = await tx.recipe.update({
          where: { id: input.id },
          data: {
            status: 'APPROVED',
            publishedAt: new Date(),
          },
        });

        await tx.recipeStatusHistory.create({
          data: {
            recipeId: input.id,
            status: 'APPROVED',
            changedBy: ctx.session.user.id,
            reason: 'Published via admin recipe builder',
          },
        });

        return updatedRecipe;
      });

      return updated;
    }),
});
