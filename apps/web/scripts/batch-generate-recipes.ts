#!/usr/bin/env tsx
/**
 * Batch recipe generation script
 * Generates recipes with AI and saves them to the database
 */
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

import { GeminiRecipeClient } from '~/server/services/geminiRecipe';
import { GeminiImageClient } from '~/server/services/geminiImage';
import { saveGeneratedImage } from '~/server/services/imageStorage';
import { deriveRecipeTags } from '~/lib/ingredients/derivation';

const prisma = new PrismaClient();

// Recipe generation parameters - 100 diverse recipes
const recipeConfigs = [
  // === BREAKFAST RECIPES (20) ===
  {
    cuisine: 'American',
    mealTypes: ['breakfast'] as const,
    difficulty: 'EASY' as const,
    hint: 'pancakes or waffles',
  },
  {
    cuisine: 'British',
    mealTypes: ['breakfast'] as const,
    difficulty: 'MEDIUM' as const,
    hint: 'full English breakfast',
  },
  {
    cuisine: 'French',
    mealTypes: ['breakfast'] as const,
    difficulty: 'EASY' as const,
    hint: 'crepes or croissant-based',
  },
  {
    cuisine: 'Mexican',
    mealTypes: ['breakfast'] as const,
    difficulty: 'EASY' as const,
    hint: 'huevos rancheros or breakfast tacos',
  },
  {
    cuisine: 'Japanese',
    mealTypes: ['breakfast'] as const,
    difficulty: 'MEDIUM' as const,
    hint: 'traditional breakfast with rice',
  },
  {
    cuisine: 'Israeli',
    mealTypes: ['breakfast'] as const,
    difficulty: 'EASY' as const,
    hint: 'shakshuka',
  },
  {
    cuisine: 'Indian',
    mealTypes: ['breakfast'] as const,
    difficulty: 'MEDIUM' as const,
    hint: 'paratha or dosa',
  },
  {
    cuisine: 'Turkish',
    mealTypes: ['breakfast'] as const,
    difficulty: 'EASY' as const,
    hint: 'menemen or traditional spread',
  },
  {
    cuisine: 'Greek',
    mealTypes: ['breakfast'] as const,
    difficulty: 'EASY' as const,
    hint: 'yogurt-based or savory pastry',
  },
  {
    cuisine: 'Spanish',
    mealTypes: ['breakfast'] as const,
    difficulty: 'EASY' as const,
    hint: 'tortilla española or churros',
  },
  {
    cuisine: 'Chinese',
    mealTypes: ['breakfast'] as const,
    difficulty: 'MEDIUM' as const,
    hint: 'congee or dim sum style',
  },
  {
    cuisine: 'Korean',
    mealTypes: ['breakfast'] as const,
    difficulty: 'MEDIUM' as const,
    hint: 'savory pancake or rice bowl',
  },
  {
    cuisine: 'Italian',
    mealTypes: ['breakfast'] as const,
    difficulty: 'EASY' as const,
    hint: 'frittata or baked eggs',
  },
  {
    cuisine: 'Middle Eastern',
    mealTypes: ['breakfast'] as const,
    difficulty: 'EASY' as const,
    hint: 'foul medames or labneh',
  },
  {
    cuisine: 'Southern American',
    mealTypes: ['breakfast'] as const,
    difficulty: 'MEDIUM' as const,
    hint: 'biscuits and gravy',
  },
  {
    cuisine: 'Scandinavian',
    mealTypes: ['breakfast'] as const,
    difficulty: 'EASY' as const,
    hint: 'open-faced sandwich',
  },
  {
    cuisine: 'Vietnamese',
    mealTypes: ['breakfast'] as const,
    difficulty: 'MEDIUM' as const,
    hint: 'banh mi or pho',
  },
  {
    cuisine: 'Australian',
    mealTypes: ['breakfast'] as const,
    difficulty: 'EASY' as const,
    hint: 'avocado toast or eggs',
  },
  {
    cuisine: 'Filipino',
    mealTypes: ['breakfast'] as const,
    difficulty: 'EASY' as const,
    hint: 'silog style',
  },
  {
    cuisine: 'Brazilian',
    mealTypes: ['breakfast'] as const,
    difficulty: 'EASY' as const,
    hint: 'pao de queijo',
  },

  // === LUNCH RECIPES (40) ===
  {
    cuisine: 'Japanese',
    mealTypes: ['lunch'] as const,
    difficulty: 'MEDIUM' as const,
    hint: 'ramen or rice bowl',
  },
  {
    cuisine: 'Japanese',
    mealTypes: ['lunch'] as const,
    difficulty: 'EASY' as const,
    hint: 'onigiri or bento style',
  },
  {
    cuisine: 'Greek',
    mealTypes: ['lunch'] as const,
    difficulty: 'EASY' as const,
    hint: 'gyro or souvlaki',
  },
  {
    cuisine: 'Greek',
    mealTypes: ['lunch'] as const,
    difficulty: 'EASY' as const,
    hint: 'mezze plate',
  },
  {
    cuisine: 'Vietnamese',
    mealTypes: ['lunch'] as const,
    difficulty: 'MEDIUM' as const,
    hint: 'banh mi sandwich',
  },
  {
    cuisine: 'Vietnamese',
    mealTypes: ['lunch'] as const,
    difficulty: 'EASY' as const,
    hint: 'fresh spring rolls',
  },
  {
    cuisine: 'Middle Eastern',
    mealTypes: ['lunch'] as const,
    difficulty: 'EASY' as const,
    hint: 'falafel wrap',
  },
  {
    cuisine: 'Middle Eastern',
    mealTypes: ['lunch'] as const,
    difficulty: 'MEDIUM' as const,
    hint: 'shawarma plate',
  },
  {
    cuisine: 'Thai',
    mealTypes: ['lunch'] as const,
    difficulty: 'MEDIUM' as const,
    hint: 'pad thai or fried rice',
  },
  {
    cuisine: 'Thai',
    mealTypes: ['lunch'] as const,
    difficulty: 'EASY' as const,
    hint: 'Thai salad',
  },
  {
    cuisine: 'Italian',
    mealTypes: ['lunch'] as const,
    difficulty: 'EASY' as const,
    hint: 'panini or bruschetta',
  },
  {
    cuisine: 'Italian',
    mealTypes: ['lunch'] as const,
    difficulty: 'MEDIUM' as const,
    hint: 'risotto or pasta salad',
  },
  {
    cuisine: 'Mexican',
    mealTypes: ['lunch'] as const,
    difficulty: 'EASY' as const,
    hint: 'tacos or quesadillas',
  },
  {
    cuisine: 'Mexican',
    mealTypes: ['lunch'] as const,
    difficulty: 'MEDIUM' as const,
    hint: 'burrito bowl',
  },
  {
    cuisine: 'Indian',
    mealTypes: ['lunch'] as const,
    difficulty: 'MEDIUM' as const,
    hint: 'curry with rice',
  },
  {
    cuisine: 'Indian',
    mealTypes: ['lunch'] as const,
    difficulty: 'EASY' as const,
    hint: 'chaat or samosa',
  },
  {
    cuisine: 'Chinese',
    mealTypes: ['lunch'] as const,
    difficulty: 'MEDIUM' as const,
    hint: 'fried rice or lo mein',
  },
  {
    cuisine: 'Chinese',
    mealTypes: ['lunch'] as const,
    difficulty: 'EASY' as const,
    hint: 'dumpling or steamed bun',
  },
  {
    cuisine: 'Korean',
    mealTypes: ['lunch'] as const,
    difficulty: 'MEDIUM' as const,
    hint: 'bibimbap',
  },
  {
    cuisine: 'Korean',
    mealTypes: ['lunch'] as const,
    difficulty: 'EASY' as const,
    hint: 'kimbap rolls',
  },
  {
    cuisine: 'American',
    mealTypes: ['lunch'] as const,
    difficulty: 'EASY' as const,
    hint: 'gourmet burger',
  },
  {
    cuisine: 'American',
    mealTypes: ['lunch'] as const,
    difficulty: 'EASY' as const,
    hint: 'club sandwich',
  },
  {
    cuisine: 'French',
    mealTypes: ['lunch'] as const,
    difficulty: 'MEDIUM' as const,
    hint: 'quiche or croque monsieur',
  },
  {
    cuisine: 'Spanish',
    mealTypes: ['lunch'] as const,
    difficulty: 'EASY' as const,
    hint: 'tapas style',
  },
  {
    cuisine: 'Lebanese',
    mealTypes: ['lunch'] as const,
    difficulty: 'EASY' as const,
    hint: 'mezze platter',
  },
  {
    cuisine: 'Turkish',
    mealTypes: ['lunch'] as const,
    difficulty: 'MEDIUM' as const,
    hint: 'kebab plate',
  },
  {
    cuisine: 'Peruvian',
    mealTypes: ['lunch'] as const,
    difficulty: 'MEDIUM' as const,
    hint: 'ceviche or lomo saltado',
  },
  {
    cuisine: 'Hawaiian',
    mealTypes: ['lunch'] as const,
    difficulty: 'EASY' as const,
    hint: 'poke bowl',
  },
  {
    cuisine: 'Cuban',
    mealTypes: ['lunch'] as const,
    difficulty: 'MEDIUM' as const,
    hint: 'Cuban sandwich',
  },
  {
    cuisine: 'Moroccan',
    mealTypes: ['lunch'] as const,
    difficulty: 'MEDIUM' as const,
    hint: 'couscous salad',
  },
  {
    cuisine: 'German',
    mealTypes: ['lunch'] as const,
    difficulty: 'EASY' as const,
    hint: 'pretzel sandwich',
  },
  {
    cuisine: 'Swedish',
    mealTypes: ['lunch'] as const,
    difficulty: 'EASY' as const,
    hint: 'Swedish meatballs',
  },
  {
    cuisine: 'Filipino',
    mealTypes: ['lunch'] as const,
    difficulty: 'MEDIUM' as const,
    hint: 'adobo or sinigang',
  },
  {
    cuisine: 'Malaysian',
    mealTypes: ['lunch'] as const,
    difficulty: 'MEDIUM' as const,
    hint: 'nasi lemak',
  },
  {
    cuisine: 'Indonesian',
    mealTypes: ['lunch'] as const,
    difficulty: 'MEDIUM' as const,
    hint: 'nasi goreng',
  },
  {
    cuisine: 'Caribbean',
    mealTypes: ['lunch'] as const,
    difficulty: 'EASY' as const,
    hint: 'jerk chicken wrap',
  },
  {
    cuisine: 'Ethiopian',
    mealTypes: ['lunch'] as const,
    difficulty: 'MEDIUM' as const,
    hint: 'injera with stew',
  },
  {
    cuisine: 'Cajun',
    mealTypes: ['lunch'] as const,
    difficulty: 'MEDIUM' as const,
    hint: 'jambalaya or po boy',
  },
  {
    cuisine: 'Portuguese',
    mealTypes: ['lunch'] as const,
    difficulty: 'MEDIUM' as const,
    hint: 'bacalhau or bifana',
  },
  {
    cuisine: 'Singaporean',
    mealTypes: ['lunch'] as const,
    difficulty: 'MEDIUM' as const,
    hint: 'laksa or chicken rice',
  },

  // === DINNER RECIPES (40) ===
  {
    cuisine: 'Italian',
    mealTypes: ['dinner'] as const,
    difficulty: 'MEDIUM' as const,
    hint: 'classic pasta dish',
  },
  {
    cuisine: 'Italian',
    mealTypes: ['dinner'] as const,
    difficulty: 'HARD' as const,
    hint: 'osso buco or lasagna',
  },
  {
    cuisine: 'French',
    mealTypes: ['dinner'] as const,
    difficulty: 'HARD' as const,
    hint: 'coq au vin or beef bourguignon',
  },
  {
    cuisine: 'French',
    mealTypes: ['dinner'] as const,
    difficulty: 'MEDIUM' as const,
    hint: 'chicken provencal',
  },
  {
    cuisine: 'Chinese',
    mealTypes: ['dinner'] as const,
    difficulty: 'MEDIUM' as const,
    hint: 'stir fry with vegetables',
  },
  {
    cuisine: 'Chinese',
    mealTypes: ['dinner'] as const,
    difficulty: 'HARD' as const,
    hint: 'Peking duck or dim sum',
  },
  {
    cuisine: 'Japanese',
    mealTypes: ['dinner'] as const,
    difficulty: 'MEDIUM' as const,
    hint: 'teriyaki or katsu',
  },
  {
    cuisine: 'Japanese',
    mealTypes: ['dinner'] as const,
    difficulty: 'HARD' as const,
    hint: 'sushi or tempura',
  },
  {
    cuisine: 'Thai',
    mealTypes: ['dinner'] as const,
    difficulty: 'MEDIUM' as const,
    hint: 'green or red curry',
  },
  {
    cuisine: 'Thai',
    mealTypes: ['dinner'] as const,
    difficulty: 'EASY' as const,
    hint: 'basil chicken',
  },
  {
    cuisine: 'Indian',
    mealTypes: ['dinner'] as const,
    difficulty: 'MEDIUM' as const,
    hint: 'butter chicken or tikka masala',
  },
  {
    cuisine: 'Indian',
    mealTypes: ['dinner'] as const,
    difficulty: 'HARD' as const,
    hint: 'biryani',
  },
  {
    cuisine: 'Indian',
    mealTypes: ['dinner'] as const,
    difficulty: 'EASY' as const,
    hint: 'dal with naan',
  },
  {
    cuisine: 'Mexican',
    mealTypes: ['dinner'] as const,
    difficulty: 'MEDIUM' as const,
    hint: 'enchiladas or tamales',
  },
  {
    cuisine: 'Mexican',
    mealTypes: ['dinner'] as const,
    difficulty: 'EASY' as const,
    hint: 'taco night',
  },
  {
    cuisine: 'Korean',
    mealTypes: ['dinner'] as const,
    difficulty: 'MEDIUM' as const,
    hint: 'bulgogi or japchae',
  },
  {
    cuisine: 'Korean',
    mealTypes: ['dinner'] as const,
    difficulty: 'HARD' as const,
    hint: 'Korean BBQ spread',
  },
  {
    cuisine: 'Mediterranean',
    mealTypes: ['dinner'] as const,
    difficulty: 'EASY' as const,
    hint: 'grilled fish with vegetables',
  },
  {
    cuisine: 'Mediterranean',
    mealTypes: ['dinner'] as const,
    difficulty: 'MEDIUM' as const,
    hint: 'lamb chops',
  },
  {
    cuisine: 'American',
    mealTypes: ['dinner'] as const,
    difficulty: 'MEDIUM' as const,
    hint: 'meatloaf or pot roast',
  },
  {
    cuisine: 'American',
    mealTypes: ['dinner'] as const,
    difficulty: 'EASY' as const,
    hint: 'sheet pan chicken',
  },
  {
    cuisine: 'Southern American',
    mealTypes: ['dinner'] as const,
    difficulty: 'MEDIUM' as const,
    hint: 'fried chicken',
  },
  {
    cuisine: 'Greek',
    mealTypes: ['dinner'] as const,
    difficulty: 'MEDIUM' as const,
    hint: 'moussaka or lamb',
  },
  {
    cuisine: 'Spanish',
    mealTypes: ['dinner'] as const,
    difficulty: 'HARD' as const,
    hint: 'paella',
  },
  {
    cuisine: 'Spanish',
    mealTypes: ['dinner'] as const,
    difficulty: 'MEDIUM' as const,
    hint: 'gambas al ajillo',
  },
  {
    cuisine: 'Moroccan',
    mealTypes: ['dinner'] as const,
    difficulty: 'MEDIUM' as const,
    hint: 'tagine',
  },
  {
    cuisine: 'Brazilian',
    mealTypes: ['dinner'] as const,
    difficulty: 'MEDIUM' as const,
    hint: 'feijoada or picanha',
  },
  {
    cuisine: 'Argentine',
    mealTypes: ['dinner'] as const,
    difficulty: 'MEDIUM' as const,
    hint: 'chimichurri steak',
  },
  {
    cuisine: 'German',
    mealTypes: ['dinner'] as const,
    difficulty: 'MEDIUM' as const,
    hint: 'schnitzel or sauerbraten',
  },
  {
    cuisine: 'Polish',
    mealTypes: ['dinner'] as const,
    difficulty: 'MEDIUM' as const,
    hint: 'pierogi or bigos',
  },
  {
    cuisine: 'Russian',
    mealTypes: ['dinner'] as const,
    difficulty: 'MEDIUM' as const,
    hint: 'beef stroganoff',
  },
  {
    cuisine: 'Hungarian',
    mealTypes: ['dinner'] as const,
    difficulty: 'MEDIUM' as const,
    hint: 'goulash or paprikash',
  },
  {
    cuisine: 'Caribbean',
    mealTypes: ['dinner'] as const,
    difficulty: 'MEDIUM' as const,
    hint: 'jerk pork or curry goat',
  },
  {
    cuisine: 'Ethiopian',
    mealTypes: ['dinner'] as const,
    difficulty: 'MEDIUM' as const,
    hint: 'doro wat',
  },
  {
    cuisine: 'Nigerian',
    mealTypes: ['dinner'] as const,
    difficulty: 'MEDIUM' as const,
    hint: 'jollof rice',
  },
  {
    cuisine: 'Vietnamese',
    mealTypes: ['dinner'] as const,
    difficulty: 'MEDIUM' as const,
    hint: 'pho or bun cha',
  },
  {
    cuisine: 'Malaysian',
    mealTypes: ['dinner'] as const,
    difficulty: 'MEDIUM' as const,
    hint: 'rendang',
  },
  {
    cuisine: 'Peruvian',
    mealTypes: ['dinner'] as const,
    difficulty: 'MEDIUM' as const,
    hint: 'aji de gallina',
  },
  {
    cuisine: 'Lebanese',
    mealTypes: ['dinner'] as const,
    difficulty: 'MEDIUM' as const,
    hint: 'kibbeh or kafta',
  },
  {
    cuisine: 'Irish',
    mealTypes: ['dinner'] as const,
    difficulty: 'EASY' as const,
    hint: 'shepherd pie or stew',
  },
];

const mealTypeSchema = z.enum(['breakfast', 'lunch', 'dinner']);
const difficultySchema = z.enum(['EASY', 'MEDIUM', 'HARD']);
const stepTypeSchema = z.enum(['PREP', 'COOK', 'REST', 'ASSEMBLE']);

const recipeDraftSchema = z.object({
  title: z.string().min(4).max(120),
  description: z.string().min(10).max(500),
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
        unit: z.string().max(30), // Allow empty for "to taste" style
        notes: z.string().max(120).optional(),
      })
    )
    .min(3),
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
  dietTags: z.array(z.string().min(2).max(60)).optional(),
  allergenTags: z.array(z.string().min(2).max(60)).optional(),
});

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
    dietTags: { type: 'array', items: { type: 'string' } },
    allergenTags: { type: 'array', items: { type: 'string' } },
  },
} as const;

function buildPrompt(input: {
  cuisine: string;
  mealTypes: readonly string[];
  difficulty: string;
  hint?: string;
}) {
  return [
    'You are a professional recipe developer.',
    'Return JSON only. Do not include markdown or explanations.',
    'Schema keys must match exactly. Keep description under 200 characters.',
    'For ingredients, always provide a unit (use "piece", "whole", or "to taste" for unitless items).',
    '',
    `Cuisine: ${input.cuisine}`,
    `Meal types: ${input.mealTypes.join(', ')}`,
    `Difficulty: ${input.difficulty}`,
    input.hint ? `Style/Inspiration: ${input.hint}` : null,
    'Servings: 4',
    '',
    'Return JSON with this shape:',
    '{',
    '  "title": string,',
    '  "description": string (under 200 chars),',
    '  "servingsDefault": number,',
    '  "prepTimeMinutes": number,',
    '  "cookTimeMinutes": number,',
    '  "totalTimeMinutes": number,',
    '  "calories": number,',
    '  "difficulty": "EASY" | "MEDIUM" | "HARD",',
    '  "mealTypes": ["breakfast" | "lunch" | "dinner"],',
    '  "ingredients": [{"name": string, "quantity": number, "unit": string, "notes"?: string}],',
    '  "steps": [{"instruction": string, "stepType"?: "PREP" | "COOK" | "REST" | "ASSEMBLE", "durationMinutes"?: number, "tips"?: string}],',
    '  "nutrition"?: {"calories": number, "protein": number, "carbohydrates": number, "fat": number},',
    '  "dietTags"?: string[] (short labels like "vegetarian", "gluten-free"),',
    '  "allergenTags"?: string[] (like "gluten", "dairy", "nuts")',
    '}',
  ]
    .filter(Boolean)
    .join('\n');
}

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

async function resolveIngredient(name: string) {
  const normalized = normalizeIngredientName(name);

  const existing = await prisma.ingredient.findFirst({
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

  const alias = await prisma.ingredientAlias.findFirst({
    where: { alias: { equals: normalized, mode: 'insensitive' } },
    include: { canonicalIngredient: true },
  });

  if (alias?.canonicalIngredient) {
    const linked = await prisma.ingredient.findFirst({
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

    const created = await prisma.ingredient.create({
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

  const canonical = await prisma.canonicalIngredient.findFirst({
    where: { name: { equals: normalized, mode: 'insensitive' } },
  });

  if (canonical) {
    const linked = await prisma.ingredient.findFirst({
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

    const created = await prisma.ingredient.create({
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

  const created = await prisma.ingredient.create({
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

async function resolveDietTags(tagNames: string[]) {
  if (tagNames.length === 0) return [];
  const existing = await prisma.dietTag.findMany({
    where: { name: { in: tagNames } },
  });
  const existingNames = new Set(existing.map((tag) => tag.name));
  const missing = tagNames.filter((name) => !existingNames.has(name));

  if (missing.length > 0) {
    await prisma.dietTag.createMany({
      data: missing.map((name) => ({ name })),
      skipDuplicates: true,
    });
  }

  return prisma.dietTag.findMany({ where: { name: { in: tagNames } } });
}

async function resolveAllergenTags(tagNames: string[]) {
  if (tagNames.length === 0) return [];
  const existing = await prisma.allergenTag.findMany({
    where: { name: { in: tagNames } },
  });
  const existingNames = new Set(existing.map((tag) => tag.name));
  const missing = tagNames.filter((name) => !existingNames.has(name));

  if (missing.length > 0) {
    await prisma.allergenTag.createMany({
      data: missing.map((name) => ({ name })),
      skipDuplicates: true,
    });
  }

  return prisma.allergenTag.findMany({ where: { name: { in: tagNames } } });
}

async function generateAndSaveRecipe(
  config: (typeof recipeConfigs)[number],
  admin: { id: string }
) {
  console.log(`\n📝 Generating ${config.cuisine} ${config.mealTypes.join('/')} recipe...`);

  const geminiRecipe = new GeminiRecipeClient();
  const geminiImage = new GeminiImageClient();

  // 1. Generate recipe draft
  const prompt = buildPrompt(config);
  const text = await geminiRecipe.generateText({
    prompt,
    responseSchema: recipeDraftResponseSchema,
  });
  const jsonPayload = extractJsonPayload(text);
  const parsed: unknown = JSON.parse(jsonPayload);
  const recipe = recipeDraftSchema.parse(parsed);

  console.log(`   ✅ Generated: ${recipe.title}`);

  // 2. Generate image
  const imagePrompt = `Overhead plated shot of ${recipe.title}. ${recipe.description}. Professional food photography, soft natural lighting, appetizing presentation.`;
  console.log(`   🎨 Generating image...`);

  const image = await geminiImage.generateImage({ prompt: imagePrompt, aspectRatio: '1:1' });
  const saved = await saveGeneratedImage({
    data: image.data,
    mimeType: image.mimeType,
    prompt: imagePrompt,
  });

  console.log(`   ✅ Image saved: ${saved.relativePath}`);

  // 3. Resolve ingredients
  const ingredientsResolved = await Promise.all(
    recipe.ingredients.map((ingredient) => resolveIngredient(ingredient.name))
  );

  // 4. Derive and resolve tags
  const derivedTags = deriveRecipeTags(
    ingredientsResolved.map((ingredient) => ({
      name: ingredient.displayName,
      canonicalIngredient: ingredient.canonicalIngredient,
    }))
  );

  const dietTagNames = Array.from(new Set([...(recipe.dietTags ?? []), ...derivedTags.dietTags]));
  const allergenTagNames = Array.from(
    new Set([...(recipe.allergenTags ?? []), ...derivedTags.allergenTags])
  );

  const [dietTags, allergenTags] = await Promise.all([
    resolveDietTags(dietTagNames),
    resolveAllergenTags(allergenTagNames),
  ]);

  // 5. Create recipe in database
  const createdRecipe = await prisma.$transaction(async (tx) => {
    const newRecipe = await tx.recipe.create({
      data: {
        title: recipe.title,
        description: recipe.description,
        servingsDefault: recipe.servingsDefault,
        prepTimeMinutes: recipe.prepTimeMinutes,
        cookTimeMinutes: recipe.cookTimeMinutes,
        totalTimeMinutes: recipe.totalTimeMinutes,
        calories: recipe.calories,
        difficulty: recipe.difficulty,
        mealTypes: recipe.mealTypes,
        status: 'APPROVED',
        publishedAt: new Date(),
      },
    });

    // Steps
    await tx.recipeStep.createMany({
      data: recipe.steps.map((step, index) => ({
        recipeId: newRecipe.id,
        stepNumber: index + 1,
        stepType: step.stepType ?? 'COOK',
        instruction: step.instruction,
        durationMinutes: step.durationMinutes,
        tips: step.tips,
      })),
    });

    // Ingredients
    const ingredientRows = recipe.ingredients.map((ingredient, index) => {
      const resolved = ingredientsResolved[index]!;
      return {
        recipeId: newRecipe.id,
        ingredientId: resolved.ingredientId,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
      };
    });
    await tx.recipeIngredient.createMany({ data: ingredientRows });

    // Nutrition
    if (recipe.nutrition) {
      await tx.recipeNutrition.create({
        data: {
          recipeId: newRecipe.id,
          calories: recipe.nutrition.calories,
          protein: recipe.nutrition.protein,
          carbohydrates: recipe.nutrition.carbohydrates,
          fat: recipe.nutrition.fat,
          fiber: recipe.nutrition.fiber,
          sugar: recipe.nutrition.sugar,
          sodium: recipe.nutrition.sodium,
        },
      });
    }

    // Image
    await tx.recipeImage.create({
      data: {
        recipeId: newRecipe.id,
        url: saved.relativePath,
        prompt: imagePrompt,
        model: image.model,
        altText: `${recipe.title} - ${recipe.description.slice(0, 80)}`,
        isPrimary: true,
      },
    });

    // Diet tags
    if (dietTags.length > 0) {
      await tx.recipeDietTag.createMany({
        data: dietTags.map((tag) => ({
          recipeId: newRecipe.id,
          dietTagId: tag.id,
        })),
        skipDuplicates: true,
      });
    }

    // Allergen tags
    if (allergenTags.length > 0) {
      await tx.recipeAllergenTag.createMany({
        data: allergenTags.map((tag) => ({
          recipeId: newRecipe.id,
          allergenTagId: tag.id,
        })),
        skipDuplicates: true,
      });
    }

    // Status history
    await tx.recipeStatusHistory.create({
      data: {
        recipeId: newRecipe.id,
        status: 'APPROVED',
        changedBy: admin.id,
        reason: 'Published via batch generation script',
      },
    });

    return newRecipe;
  });

  console.log(`   ✅ Recipe saved to database: ${createdRecipe.id}`);
  return createdRecipe;
}

async function main() {
  console.log('🚀 Starting batch recipe generation...\n');

  // Get admin user
  const admin = await prisma.user.findFirst({ where: { role: 'admin' } });
  if (!admin) {
    throw new Error('No admin user found. Run db:seed first.');
  }
  console.log(`Using admin: ${admin.email}`);

  // Check existing recipe count
  const existingCount = await prisma.recipe.count({ where: { status: 'APPROVED' } });
  console.log(`Existing approved recipes: ${existingCount}`);

  const results: { title: string; success: boolean; error?: string }[] = [];

  for (const config of recipeConfigs) {
    try {
      const recipe = await generateAndSaveRecipe(config, admin);
      results.push({ title: recipe.title, success: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error(`   ❌ Failed: ${message}`);
      results.push({
        title: `${config.cuisine} ${config.mealTypes.join('/')}`,
        success: false,
        error: message,
      });
    }

    // Small delay between recipes to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  // Summary
  console.log('\n📊 Generation Summary:');
  console.log('━'.repeat(50));
  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);
  console.log(`✅ Successful: ${successful.length}`);
  console.log(`❌ Failed: ${failed.length}`);

  if (failed.length > 0) {
    console.log('\nFailed recipes:');
    failed.forEach((r) => console.log(`  - ${r.title}: ${r.error}`));
  }

  const finalCount = await prisma.recipe.count({ where: { status: 'APPROVED' } });
  console.log(`\nTotal approved recipes: ${finalCount}`);
}

main()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
