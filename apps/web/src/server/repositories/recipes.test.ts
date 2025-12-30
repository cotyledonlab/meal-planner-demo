import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { PrismaClient } from '@prisma/client';
import { RecipeRepository, filterRecipesByDislikes, parseDislikes } from './recipes';
import type { RecipeForPlanning, MealType } from '@meal-planner-demo/types';

// Mock Prisma types for testing
type MockRecipeWithRelations = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  mealTypes: string[];
  servingsDefault: number;
  prepTimeMinutes: number | null;
  cookTimeMinutes: number | null;
  totalTimeMinutes: number | null;
  minutes: number;
  calories: number;
  status: string;
  difficulty: string;
  publishedAt: Date | null;
  sourceUrl: string | null;
  sourceAttribution: string | null;
  isVegetarian: boolean;
  isDairyFree: boolean;
  instructionsMd: string;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  ingredients: Array<{
    id: string;
    recipeId: string;
    ingredientId: string;
    quantity: number;
    unit: string;
    ingredient: {
      id: string;
      name: string;
      category: string;
    };
  }>;
  steps: Array<{
    id: string;
    recipeId: string;
    stepNumber: number;
    stepType: string;
    instruction: string;
    durationMinutes: number | null;
    tips: string | null;
    imageUrl: string | null;
  }>;
  nutrition: {
    id: string;
    recipeId: string;
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
    fiber: number | null;
    sugar: number | null;
    sodium: number | null;
    cholesterol: number | null;
    saturatedFat: number | null;
  } | null;
  images: Array<{
    id: string;
    recipeId: string;
    url: string;
    prompt: string | null;
    model: string | null;
    isPrimary: boolean;
    width: number | null;
    height: number | null;
    fileSize: number | null;
    mimeType: string | null;
    altText: string | null;
  }>;
  dietTags: Array<{
    dietTag: {
      id: string;
      name: string;
      description: string | null;
    };
  }>;
  allergenTags: Array<{
    allergenTag: {
      id: string;
      name: string;
      description: string | null;
      severity: string | null;
    };
  }>;
};

describe('RecipeRepository', () => {
  let mockPrisma: {
    recipe: {
      findUnique: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
      count: ReturnType<typeof vi.fn>;
    };
    dietTag: {
      findMany: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
    };
    allergenTag: {
      findMany: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
    };
    recipeStatusHistory: {
      create: ReturnType<typeof vi.fn>;
    };
    $transaction: ReturnType<typeof vi.fn>;
  };

  const mockRecipe: MockRecipeWithRelations = {
    id: 'recipe-1',
    title: 'Test Recipe',
    slug: 'test-recipe',
    description: 'A test recipe',
    mealTypes: ['dinner'],
    servingsDefault: 4,
    prepTimeMinutes: 10,
    cookTimeMinutes: 20,
    totalTimeMinutes: 30,
    minutes: 30,
    calories: 400,
    status: 'APPROVED',
    difficulty: 'MEDIUM',
    publishedAt: new Date(),
    sourceUrl: null,
    sourceAttribution: null,
    isVegetarian: false,
    isDairyFree: true,
    instructionsMd: '## Instructions\n1. Cook',
    imageUrl: 'https://example.com/image.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
    ingredients: [
      {
        id: 'ri-1',
        recipeId: 'recipe-1',
        ingredientId: 'ing-1',
        quantity: 500,
        unit: 'g',
        ingredient: {
          id: 'ing-1',
          name: 'chicken',
          category: 'protein',
        },
      },
    ],
    steps: [
      {
        id: 'step-1',
        recipeId: 'recipe-1',
        stepNumber: 1,
        stepType: 'COOK',
        instruction: 'Cook the chicken',
        durationMinutes: null,
        tips: null,
        imageUrl: null,
      },
    ],
    nutrition: {
      id: 'nut-1',
      recipeId: 'recipe-1',
      calories: 400,
      protein: 30,
      carbohydrates: 40,
      fat: 15,
      fiber: null,
      sugar: null,
      sodium: null,
      cholesterol: null,
      saturatedFat: null,
    },
    images: [
      {
        id: 'img-1',
        recipeId: 'recipe-1',
        url: 'https://example.com/image.jpg',
        prompt: null,
        model: null,
        isPrimary: true,
        width: null,
        height: null,
        fileSize: null,
        mimeType: null,
        altText: 'Test Recipe',
      },
    ],
    dietTags: [
      {
        dietTag: {
          id: 'diet-1',
          name: 'dairy-free',
          description: null,
        },
      },
    ],
    allergenTags: [],
  };

  beforeEach(() => {
    mockPrisma = {
      recipe: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        count: vi.fn(),
      },
      dietTag: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
      },
      allergenTag: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
      },
      recipeStatusHistory: {
        create: vi.fn(),
      },
      $transaction: vi.fn(),
    };
  });

  describe('findById', () => {
    it('returns null when recipe not found', async () => {
      mockPrisma.recipe.findUnique.mockResolvedValue(null);

      const repo = new RecipeRepository(mockPrisma as unknown as PrismaClient);
      const result = await repo.findById('nonexistent');

      expect(result).toBeNull();
    });

    it('returns mapped recipe with relations', async () => {
      mockPrisma.recipe.findUnique.mockResolvedValue(mockRecipe);

      const repo = new RecipeRepository(mockPrisma as unknown as PrismaClient);
      const result = await repo.findById('recipe-1');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('recipe-1');
      expect(result?.title).toBe('Test Recipe');
      expect(result?.ingredients).toHaveLength(1);
      expect(result?.ingredients[0]?.ingredient.name).toBe('chicken');
      expect(result?.steps).toHaveLength(1);
      expect(result?.nutrition?.calories).toBe(400);
      expect(result?.dietTags).toHaveLength(1);
    });
  });

  describe('findBySlug', () => {
    it('returns null when recipe not found', async () => {
      mockPrisma.recipe.findUnique.mockResolvedValue(null);

      const repo = new RecipeRepository(mockPrisma as unknown as PrismaClient);
      const result = await repo.findBySlug('nonexistent');

      expect(result).toBeNull();
    });

    it('returns mapped recipe with relations', async () => {
      mockPrisma.recipe.findUnique.mockResolvedValue(mockRecipe);

      const repo = new RecipeRepository(mockPrisma as unknown as PrismaClient);
      const result = await repo.findBySlug('test-recipe');

      expect(result).not.toBeNull();
      expect(result?.slug).toBe('test-recipe');
    });
  });

  describe('findForPlanning', () => {
    it('returns empty array when no recipes found', async () => {
      mockPrisma.recipe.findMany.mockResolvedValue([]);

      const repo = new RecipeRepository(mockPrisma as unknown as PrismaClient);
      const result = await repo.findForPlanning();

      expect(result).toEqual([]);
    });

    it('returns mapped recipes for planning', async () => {
      mockPrisma.recipe.findMany.mockResolvedValue([mockRecipe]);

      const repo = new RecipeRepository(mockPrisma as unknown as PrismaClient);
      const result = await repo.findForPlanning();

      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe('recipe-1');
      expect(result[0]?.title).toBe('Test Recipe');
      expect(result[0]?.mealTypes).toEqual(['dinner']);
      expect(result[0]?.ingredients).toHaveLength(1);
    });

    it('applies dietary filters', async () => {
      mockPrisma.recipe.findMany.mockResolvedValue([mockRecipe]);

      const repo = new RecipeRepository(mockPrisma as unknown as PrismaClient);
      await repo.findForPlanning({ isVegetarian: true, isDairyFree: true });

      expect(mockPrisma.recipe.findMany).toHaveBeenCalledWith({
        where: {
          isVegetarian: true,
          isDairyFree: true,
        },
        include: {
          ingredients: { include: { ingredient: true } },
        },
      });
    });

    it('applies status filter', async () => {
      mockPrisma.recipe.findMany.mockResolvedValue([mockRecipe]);

      const repo = new RecipeRepository(mockPrisma as unknown as PrismaClient);
      await repo.findForPlanning({ status: 'APPROVED' });

      expect(mockPrisma.recipe.findMany).toHaveBeenCalledWith({
        where: {
          status: 'APPROVED',
        },
        include: {
          ingredients: { include: { ingredient: true } },
        },
      });
    });
  });

  describe('findByMealType', () => {
    it('filters recipes by meal type', async () => {
      const dinnerRecipe = { ...mockRecipe, mealTypes: ['dinner'] };
      const breakfastRecipe = { ...mockRecipe, id: 'recipe-2', mealTypes: ['breakfast'] };

      mockPrisma.recipe.findMany.mockResolvedValue([dinnerRecipe, breakfastRecipe]);

      const repo = new RecipeRepository(mockPrisma as unknown as PrismaClient);
      const result = await repo.findByMealType('dinner');

      expect(result).toHaveLength(1);
      expect(result[0]?.mealTypes).toContain('dinner');
    });
  });

  describe('getDietTags', () => {
    it('returns all diet tags', async () => {
      const tags = [
        { id: 'tag-1', name: 'vegetarian', description: null },
        { id: 'tag-2', name: 'vegan', description: null },
      ];
      mockPrisma.dietTag.findMany.mockResolvedValue(tags);

      const repo = new RecipeRepository(mockPrisma as unknown as PrismaClient);
      const result = await repo.getDietTags();

      expect(result).toHaveLength(2);
      expect(result[0]?.name).toBe('vegetarian');
    });
  });

  describe('getAllergenTags', () => {
    it('returns all allergen tags', async () => {
      const tags = [
        { id: 'tag-1', name: 'gluten', description: null, severity: null },
        { id: 'tag-2', name: 'dairy', description: null, severity: null },
      ];
      mockPrisma.allergenTag.findMany.mockResolvedValue(tags);

      const repo = new RecipeRepository(mockPrisma as unknown as PrismaClient);
      const result = await repo.getAllergenTags();

      expect(result).toHaveLength(2);
      expect(result[0]?.name).toBe('gluten');
    });
  });

  describe('count', () => {
    it('returns recipe count', async () => {
      mockPrisma.recipe.count.mockResolvedValue(42);

      const repo = new RecipeRepository(mockPrisma as unknown as PrismaClient);
      const result = await repo.count();

      expect(result).toBe(42);
    });

    it('applies filters to count', async () => {
      mockPrisma.recipe.count.mockResolvedValue(5);

      const repo = new RecipeRepository(mockPrisma as unknown as PrismaClient);
      await repo.count({ isVegetarian: true });

      expect(mockPrisma.recipe.count).toHaveBeenCalledWith({
        where: { isVegetarian: true },
      });
    });
  });
});

describe('filterRecipesByDislikes', () => {
  const createRecipe = (id: string, ingredients: string[]): RecipeForPlanning => ({
    id,
    title: `Recipe ${id}`,
    mealTypes: ['dinner'] as MealType[],
    servingsDefault: 4,
    calories: 400,
    isVegetarian: false,
    isDairyFree: false,
    ingredients: ingredients.map((name, i) => ({
      ingredient: { id: `ing-${i}`, name, category: 'protein' },
      quantity: 100,
      unit: 'g',
    })),
  });

  it('returns all recipes when no dislikes', () => {
    const recipes = [createRecipe('1', ['chicken']), createRecipe('2', ['beef'])];

    const result = filterRecipesByDislikes(recipes, []);

    expect(result).toHaveLength(2);
  });

  it('filters out recipes with disliked ingredients', () => {
    const recipes = [
      createRecipe('1', ['chicken']),
      createRecipe('2', ['mushrooms']),
      createRecipe('3', ['beef']),
    ];

    const result = filterRecipesByDislikes(recipes, ['mushroom']);

    expect(result).toHaveLength(2);
    expect(result.map((r) => r.id)).toEqual(['1', '3']);
  });

  it('handles case-insensitive matching', () => {
    const recipes = [createRecipe('1', ['Chicken Breast']), createRecipe('2', ['MUSHROOMS'])];

    const result = filterRecipesByDislikes(recipes, ['mushroom']);

    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe('1');
  });

  it('handles partial matches', () => {
    const recipes = [createRecipe('1', ['chicken breast']), createRecipe('2', ['chicken thighs'])];

    const result = filterRecipesByDislikes(recipes, ['chicken']);

    expect(result).toHaveLength(0);
  });

  it('keeps recipes with empty ingredients', () => {
    const recipes = [createRecipe('1', [])];

    const result = filterRecipesByDislikes(recipes, ['chicken']);

    expect(result).toHaveLength(1);
  });

  it('handles multiple dislike terms', () => {
    const recipes = [
      createRecipe('1', ['chicken']),
      createRecipe('2', ['mushrooms']),
      createRecipe('3', ['beef']),
      createRecipe('4', ['onions']),
    ];

    const result = filterRecipesByDislikes(recipes, ['mushroom', 'onion']);

    expect(result).toHaveLength(2);
    expect(result.map((r) => r.id)).toEqual(['1', '3']);
  });
});

describe('parseDislikes', () => {
  it('returns empty array for null input', () => {
    expect(parseDislikes(null)).toEqual([]);
  });

  it('returns empty array for undefined input', () => {
    expect(parseDislikes(undefined)).toEqual([]);
  });

  it('returns empty array for empty string', () => {
    expect(parseDislikes('')).toEqual([]);
  });

  it('parses single dislike', () => {
    expect(parseDislikes('mushroom')).toEqual(['mushroom']);
  });

  it('parses comma-separated dislikes', () => {
    expect(parseDislikes('mushroom, onion, garlic')).toEqual(['mushroom', 'onion', 'garlic']);
  });

  it('trims whitespace', () => {
    expect(parseDislikes('  mushroom  ,  onion  ')).toEqual(['mushroom', 'onion']);
  });

  it('converts to lowercase', () => {
    expect(parseDislikes('MUSHROOM, Onion')).toEqual(['mushroom', 'onion']);
  });

  it('filters out empty entries', () => {
    expect(parseDislikes('mushroom,,onion,,')).toEqual(['mushroom', 'onion']);
  });
});
