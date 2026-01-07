/**
 * Recipe Repository
 *
 * Provides a data access layer for recipe operations, abstracting Prisma
 * queries and providing type-safe interfaces for the recipe domain.
 */

import { type PrismaClient, type Prisma } from '@prisma/client';
import type {
  Recipe,
  RecipeWithRelations,
  RecipeForPlanning,
  RecipeFilters,
  CreateRecipeInput,
  CreateRecipeStepInput,
  CreateRecipeIngredientInput,
  CreateRecipeImageInput,
  DietTag,
  AllergenTag,
  MealType,
} from '@meal-planner-demo/types';

// Type for Prisma recipe with all relations included
type PrismaRecipeWithRelations = Prisma.RecipeGetPayload<{
  include: {
    ingredients: { include: { ingredient: true } };
    steps: true;
    nutrition: true;
    images: true;
    dietTags: { include: { dietTag: true } };
    allergenTags: { include: { allergenTag: true } };
  };
}>;

// Type for Prisma recipe for planning (subset)
type PrismaRecipeForPlanning = Prisma.RecipeGetPayload<{
  include: {
    ingredients: { include: { ingredient: true } };
  };
}>;

/**
 * Recipe Repository class providing CRUD and query operations
 */
export class RecipeRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * Find a recipe by ID with all relations
   */
  async findById(id: string): Promise<RecipeWithRelations | null> {
    const recipe = await this.prisma.recipe.findUnique({
      where: { id },
      include: {
        ingredients: { include: { ingredient: true } },
        steps: { orderBy: { stepNumber: 'asc' } },
        nutrition: true,
        images: true,
        dietTags: { include: { dietTag: true } },
        allergenTags: { include: { allergenTag: true } },
      },
    });

    return recipe ? this.mapToRecipeWithRelations(recipe) : null;
  }

  /**
   * Find a recipe by slug with all relations
   */
  async findBySlug(slug: string): Promise<RecipeWithRelations | null> {
    const recipe = await this.prisma.recipe.findUnique({
      where: { slug },
      include: {
        ingredients: { include: { ingredient: true } },
        steps: { orderBy: { stepNumber: 'asc' } },
        nutrition: true,
        images: true,
        dietTags: { include: { dietTag: true } },
        allergenTags: { include: { allergenTag: true } },
      },
    });

    return recipe ? this.mapToRecipeWithRelations(recipe) : null;
  }

  /**
   * Find all recipes matching filters (for plan generation)
   */
  async findForPlanning(filters: RecipeFilters = {}): Promise<RecipeForPlanning[]> {
    const where = this.buildWhereClause(filters);

    const recipes = await this.prisma.recipe.findMany({
      where,
      include: {
        ingredients: { include: { ingredient: true } },
      },
    });

    return recipes.map((recipe) => this.mapToRecipeForPlanning(recipe));
  }

  /**
   * Find all recipes with full relations
   */
  async findAll(filters: RecipeFilters = {}): Promise<RecipeWithRelations[]> {
    const where = this.buildWhereClause(filters);

    const recipes = await this.prisma.recipe.findMany({
      where,
      include: {
        ingredients: { include: { ingredient: true } },
        steps: { orderBy: { stepNumber: 'asc' } },
        nutrition: true,
        images: true,
        dietTags: { include: { dietTag: true } },
        allergenTags: { include: { allergenTag: true } },
      },
      orderBy: { title: 'asc' },
    });

    return recipes.map((recipe) => this.mapToRecipeWithRelations(recipe));
  }

  /**
   * Find approved recipes for a specific meal type
   */
  async findByMealType(
    mealType: MealType,
    filters: RecipeFilters = {}
  ): Promise<RecipeForPlanning[]> {
    const recipes = await this.findForPlanning({
      ...filters,
      mealTypes: [mealType],
    });

    // Filter to recipes that include this meal type
    return recipes.filter((recipe) => recipe.mealTypes.includes(mealType));
  }

  /**
   * Create a new recipe with all relations
   */
  async create(input: CreateRecipeInput): Promise<RecipeWithRelations> {
    const recipe = await this.prisma.recipe.create({
      data: {
        title: input.title,
        slug: input.slug ?? this.generateSlug(input.title),
        description: input.description,
        mealTypes: input.mealTypes,
        servingsDefault: input.servingsDefault ?? 4,
        prepTimeMinutes: input.prepTimeMinutes,
        cookTimeMinutes: input.cookTimeMinutes,
        totalTimeMinutes:
          input.totalTimeMinutes ??
          ((input.prepTimeMinutes ?? 0) + (input.cookTimeMinutes ?? 0) || null),
        minutes: (input.prepTimeMinutes ?? 0) + (input.cookTimeMinutes ?? 0) || input.calories, // fallback for legacy
        calories: input.calories,
        status: input.status ?? 'DRAFT',
        difficulty: input.difficulty ?? 'MEDIUM',
        sourceUrl: input.sourceUrl,
        sourceAttribution: input.sourceAttribution,
        isVegetarian: input.isVegetarian ?? false,
        isDairyFree: input.isDairyFree ?? false,
        instructionsMd: input.instructionsMd ?? '',
        imageUrl: input.imageUrl,

        // Create related records
        steps: input.steps
          ? {
              create: input.steps.map((step: CreateRecipeStepInput) => ({
                stepNumber: step.stepNumber,
                stepType: step.stepType,
                instruction: step.instruction,
                durationMinutes: step.durationMinutes,
                tips: step.tips,
                imageUrl: step.imageUrl,
              })),
            }
          : undefined,

        nutrition: input.nutrition
          ? {
              create: {
                calories: input.nutrition.calories,
                protein: input.nutrition.protein,
                carbohydrates: input.nutrition.carbohydrates,
                fat: input.nutrition.fat,
                fiber: input.nutrition.fiber,
                sugar: input.nutrition.sugar,
                sodium: input.nutrition.sodium,
                cholesterol: input.nutrition.cholesterol,
                saturatedFat: input.nutrition.saturatedFat,
              },
            }
          : undefined,

        ingredients: input.ingredients
          ? {
              create: input.ingredients.map((ing: CreateRecipeIngredientInput) => ({
                ingredientId: ing.ingredientId,
                quantity: ing.quantity,
                unit: ing.unit,
              })),
            }
          : undefined,

        images: input.images
          ? {
              create: input.images.map((img: CreateRecipeImageInput) => ({
                url: img.url,
                prompt: img.prompt,
                model: img.model,
                isPrimary: img.isPrimary ?? false,
                width: img.width,
                height: img.height,
                fileSize: img.fileSize,
                mimeType: img.mimeType,
                altText: img.altText,
              })),
            }
          : undefined,

        dietTags: input.dietTagIds
          ? {
              create: input.dietTagIds.map((tagId: string) => ({
                dietTagId: tagId,
              })),
            }
          : undefined,

        allergenTags: input.allergenTagIds
          ? {
              create: input.allergenTagIds.map((tagId: string) => ({
                allergenTagId: tagId,
              })),
            }
          : undefined,
      },
      include: {
        ingredients: { include: { ingredient: true } },
        steps: { orderBy: { stepNumber: 'asc' } },
        nutrition: true,
        images: true,
        dietTags: { include: { dietTag: true } },
        allergenTags: { include: { allergenTag: true } },
      },
    });

    return this.mapToRecipeWithRelations(recipe);
  }

  /**
   * Update recipe status and create history entry
   */
  async updateStatus(
    recipeId: string,
    status: Recipe['status'],
    changedBy?: string,
    reason?: string
  ): Promise<Recipe> {
    const [recipe] = await this.prisma.$transaction([
      this.prisma.recipe.update({
        where: { id: recipeId },
        data: {
          status,
          publishedAt: status === 'APPROVED' ? new Date() : undefined,
        },
      }),
      this.prisma.recipeStatusHistory.create({
        data: {
          recipeId,
          status,
          changedBy,
          reason,
        },
      }),
    ]);

    return this.mapToRecipe(recipe);
  }

  /**
   * Get all diet tags
   */
  async getDietTags(): Promise<DietTag[]> {
    const tags = await this.prisma.dietTag.findMany({
      orderBy: { name: 'asc' },
    });
    return tags;
  }

  /**
   * Get all allergen tags
   */
  async getAllergenTags(): Promise<AllergenTag[]> {
    const tags = await this.prisma.allergenTag.findMany({
      orderBy: { name: 'asc' },
    });
    return tags;
  }

  /**
   * Find or create a diet tag by name
   */
  async findOrCreateDietTag(name: string, description?: string): Promise<DietTag> {
    const existing = await this.prisma.dietTag.findUnique({
      where: { name },
    });

    if (existing) return existing;

    return this.prisma.dietTag.create({
      data: { name, description },
    });
  }

  /**
   * Find or create an allergen tag by name
   */
  async findOrCreateAllergenTag(
    name: string,
    description?: string,
    severity?: string
  ): Promise<AllergenTag> {
    const existing = await this.prisma.allergenTag.findUnique({
      where: { name },
    });

    if (existing) return existing;

    return this.prisma.allergenTag.create({
      data: { name, description, severity },
    });
  }

  /**
   * Count recipes matching filters
   */
  async count(filters: RecipeFilters = {}): Promise<number> {
    const where = this.buildWhereClause(filters);
    return this.prisma.recipe.count({ where });
  }

  // Private helper methods

  private buildWhereClause(filters: RecipeFilters): Prisma.RecipeWhereInput {
    const where: Prisma.RecipeWhereInput = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.isVegetarian !== undefined) {
      where.isVegetarian = filters.isVegetarian;
    }

    if (filters.isDairyFree !== undefined) {
      where.isDairyFree = filters.isDairyFree;
    }

    if (filters.difficulty) {
      where.difficulty = filters.difficulty;
    }

    if (filters.mealTypes && filters.mealTypes.length > 0) {
      where.mealTypes = { hasSome: filters.mealTypes };
    }

    if (filters.dietTagIds && filters.dietTagIds.length > 0) {
      where.dietTags = {
        some: {
          dietTagId: { in: filters.dietTagIds },
        },
      };
    }

    if (filters.excludeAllergenTagIds && filters.excludeAllergenTagIds.length > 0) {
      where.allergenTags = {
        none: {
          allergenTagId: { in: filters.excludeAllergenTagIds },
        },
      };
    }

    if (filters.excludeAllergenNames && filters.excludeAllergenNames.length > 0) {
      where.allergenTags = {
        ...where.allergenTags,
        none: {
          allergenTag: {
            name: { in: filters.excludeAllergenNames, mode: 'insensitive' },
          },
        },
      };
    }

    if (filters.excludeIngredientNames && filters.excludeIngredientNames.length > 0) {
      where.ingredients = {
        none: {
          ingredient: {
            name: { in: filters.excludeIngredientNames, mode: 'insensitive' },
          },
        },
      };
    }

    if (filters.maxPrepTime !== undefined) {
      where.prepTimeMinutes = { lte: filters.maxPrepTime };
    }

    if (filters.maxCookTime !== undefined) {
      where.cookTimeMinutes = { lte: filters.maxCookTime };
    }

    if (filters.maxTotalTime !== undefined) {
      where.totalTimeMinutes = { lte: filters.maxTotalTime };
    }

    return where;
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private mapToRecipe(prismaRecipe: Prisma.RecipeGetPayload<object>): Recipe {
    return {
      id: prismaRecipe.id,
      title: prismaRecipe.title,
      slug: prismaRecipe.slug,
      description: prismaRecipe.description,
      mealTypes: prismaRecipe.mealTypes as MealType[],
      servingsDefault: prismaRecipe.servingsDefault,
      prepTimeMinutes: prismaRecipe.prepTimeMinutes,
      cookTimeMinutes: prismaRecipe.cookTimeMinutes,
      totalTimeMinutes: prismaRecipe.totalTimeMinutes,
      minutes: prismaRecipe.minutes,
      calories: prismaRecipe.calories,
      status: prismaRecipe.status as Recipe['status'],
      difficulty: prismaRecipe.difficulty as Recipe['difficulty'],
      publishedAt: prismaRecipe.publishedAt,
      sourceUrl: prismaRecipe.sourceUrl,
      sourceAttribution: prismaRecipe.sourceAttribution,
      isVegetarian: prismaRecipe.isVegetarian,
      isDairyFree: prismaRecipe.isDairyFree,
      instructionsMd: prismaRecipe.instructionsMd,
      imageUrl: prismaRecipe.imageUrl,
      createdAt: prismaRecipe.createdAt,
      updatedAt: prismaRecipe.updatedAt,
    };
  }

  private mapToRecipeWithRelations(prismaRecipe: PrismaRecipeWithRelations): RecipeWithRelations {
    return {
      ...this.mapToRecipe(prismaRecipe),
      ingredients: prismaRecipe.ingredients.map((ri) => ({
        id: ri.id,
        recipeId: ri.recipeId,
        ingredientId: ri.ingredientId,
        quantity: ri.quantity,
        unit: ri.unit,
        ingredient: {
          id: ri.ingredient.id,
          name: ri.ingredient.name,
          category: ri.ingredient.category,
        },
      })),
      steps: prismaRecipe.steps.map((step) => ({
        id: step.id,
        recipeId: step.recipeId,
        stepNumber: step.stepNumber,
        stepType: step.stepType as 'PREP' | 'COOK' | 'REST' | 'ASSEMBLE',
        instruction: step.instruction,
        durationMinutes: step.durationMinutes,
        tips: step.tips,
        imageUrl: step.imageUrl,
      })),
      nutrition: prismaRecipe.nutrition
        ? {
            id: prismaRecipe.nutrition.id,
            recipeId: prismaRecipe.nutrition.recipeId,
            calories: prismaRecipe.nutrition.calories,
            protein: prismaRecipe.nutrition.protein,
            carbohydrates: prismaRecipe.nutrition.carbohydrates,
            fat: prismaRecipe.nutrition.fat,
            fiber: prismaRecipe.nutrition.fiber,
            sugar: prismaRecipe.nutrition.sugar,
            sodium: prismaRecipe.nutrition.sodium,
            cholesterol: prismaRecipe.nutrition.cholesterol,
            saturatedFat: prismaRecipe.nutrition.saturatedFat,
          }
        : null,
      images: prismaRecipe.images.map((img) => ({
        id: img.id,
        recipeId: img.recipeId,
        url: img.url,
        prompt: img.prompt,
        model: img.model,
        isPrimary: img.isPrimary,
        width: img.width,
        height: img.height,
        fileSize: img.fileSize,
        mimeType: img.mimeType,
        altText: img.altText,
      })),
      dietTags: prismaRecipe.dietTags.map((dt) => ({
        dietTag: {
          id: dt.dietTag.id,
          name: dt.dietTag.name,
          description: dt.dietTag.description,
        },
      })),
      allergenTags: prismaRecipe.allergenTags.map((at) => ({
        allergenTag: {
          id: at.allergenTag.id,
          name: at.allergenTag.name,
          description: at.allergenTag.description,
          severity: at.allergenTag.severity,
        },
      })),
    };
  }

  private mapToRecipeForPlanning(prismaRecipe: PrismaRecipeForPlanning): RecipeForPlanning {
    return {
      id: prismaRecipe.id,
      title: prismaRecipe.title,
      mealTypes: prismaRecipe.mealTypes as MealType[],
      servingsDefault: prismaRecipe.servingsDefault,
      calories: prismaRecipe.calories,
      prepTimeMinutes: prismaRecipe.prepTimeMinutes,
      cookTimeMinutes: prismaRecipe.cookTimeMinutes,
      totalTimeMinutes: prismaRecipe.totalTimeMinutes,
      minutes: prismaRecipe.minutes,
      isVegetarian: prismaRecipe.isVegetarian,
      isDairyFree: prismaRecipe.isDairyFree,
      ingredients: prismaRecipe.ingredients.map((ri) => ({
        ingredient: {
          id: ri.ingredient.id,
          name: ri.ingredient.name,
          category: ri.ingredient.category,
        },
        quantity: ri.quantity,
        unit: ri.unit,
      })),
    };
  }
}

/**
 * Helper function to filter recipes by disliked ingredients
 * Used by plan generator and other services
 */
export function filterRecipesByDislikes(
  recipes: RecipeForPlanning[],
  dislikeTerms: string[]
): RecipeForPlanning[] {
  if (dislikeTerms.length === 0) return recipes;

  return recipes.filter((recipe: RecipeForPlanning) => {
    const ingredientNames = recipe.ingredients
      .map((ri: RecipeForPlanning['ingredients'][number]) => ri.ingredient.name.toLowerCase())
      .filter((name: string) => name.length > 0);

    if (ingredientNames.length === 0) return true;

    return !dislikeTerms.some((term: string) =>
      ingredientNames.some((name: string) => name.includes(term))
    );
  });
}

/**
 * Helper function to parse dislike string into array of terms
 */
export function parseDislikes(dislikes: string | null | undefined): string[] {
  if (!dislikes) return [];
  return dislikes
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter((entry) => entry.length > 0);
}
