import { type PrismaClient } from '@prisma/client';

interface GeneratePlanInput {
  userId: string;
  startDate?: Date;
  days?: number;
  mealsPerDay?: number;
  householdSize?: number;
  isVegetarian?: boolean;
  isDairyFree?: boolean;
}

interface MealPlanOutput {
  id: string;
  userId: string;
  startDate: Date;
  days: number;
  createdAt: Date;
}

export class PlanGenerator {
  constructor(private prisma: PrismaClient) {}

  async generatePlan(input: GeneratePlanInput): Promise<MealPlanOutput> {
    const {
      userId,
      startDate = this.getNextMonday(),
      days: requestedDays = 7,
      mealsPerDay = 1,
      householdSize = 2,
      isVegetarian = false,
      isDairyFree = false,
    } = input;

    // Get user to check their role/plan limits
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Hybrid role-based gating: respect user input but cap by role
    const maxDays = user.role === 'premium' ? 7 : 3;
    const days = Math.min(requestedDays, maxDays);

    // Determine which meal types to include based on mealsPerDay
    const mealTypes = this.getMealTypesForCount(mealsPerDay);

    // Get available recipes with dietary filters
    const recipes = await this.prisma.recipe.findMany({
      where: {
        ...(isVegetarian && { isVegetarian: true }),
        ...(isDairyFree && { isDairyFree: true }),
      },
      include: {
        ingredients: {
          include: {
            ingredient: true,
          },
        },
      },
    });

    if (recipes.length === 0) {
      throw new Error('No recipes available. Please seed the database first.');
    }

    // Cache recipes by meal type to avoid repeated filtering in nested loops
    const recipesByMealType = new Map<string, typeof recipes>();
    for (const mealType of mealTypes) {
      const appropriateRecipes = recipes.filter((recipe) => {
        return Array.isArray(recipe.mealTypes) && recipe.mealTypes.includes(mealType);
      });
      
      if (appropriateRecipes.length === 0) {
        throw new Error(
          `No recipes available for ${mealType}. Please add more recipes to the database.`
        );
      }
      
      recipesByMealType.set(mealType, appropriateRecipes);
    }

    // Prepare meal plan items data
    const mealPlanItemsData: Array<{
      dayIndex: number;
      mealType: string;
      recipeId: string;
      servings: number;
    }> = [];

    for (let dayIndex = 0; dayIndex < days; dayIndex++) {
      for (const mealType of mealTypes) {
        // Use pre-filtered recipes from the cache
        const appropriateRecipes = recipesByMealType.get(mealType);
        if (!appropriateRecipes || appropriateRecipes.length === 0) {
          continue; // This should never happen due to validation above, but handle gracefully
        }

        // Pick a random recipe for variety (efficient)
        const randomIndex = Math.floor(Math.random() * appropriateRecipes.length);
        const recipe = appropriateRecipes[randomIndex];
        if (!recipe) continue;

        mealPlanItemsData.push({
          dayIndex,
          mealType,
          recipeId: recipe.id,
          servings: householdSize,
        });
      }
    }

    // Create the meal plan and all items in a single transaction
    const plan = await this.prisma.$transaction(async (tx) => {
      // Create the meal plan
      const createdPlan = await tx.mealPlan.create({
        data: {
          userId,
          startDate,
          days,
        },
      });

      // Create all meal plan items
      await tx.mealPlanItem.createMany({
        data: mealPlanItemsData.map((item) => ({
          ...item,
          planId: createdPlan.id,
        })),
      });

      return {
        id: createdPlan.id,
        userId: createdPlan.userId,
        startDate: createdPlan.startDate,
        days: createdPlan.days,
        createdAt: createdPlan.createdAt,
      } as MealPlanOutput;
    });

    return plan;
  }

  /**
   * Get the next Monday from today
   */
  private getNextMonday(): Date {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + daysUntilMonday);
    nextMonday.setHours(0, 0, 0, 0);
    return nextMonday;
  }

  /**
   * Simple Fisher-Yates shuffle for randomizing recipes
   */
  private shuffleArray<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j]!, result[i]!];
    }
    return result;
  }

  /**
   * Determine which meal types to generate based on meals per day
   * 1 meal/day → dinner only
   * 2 meals/day → lunch + dinner
   * 3 meals/day → breakfast + lunch + dinner
   */
  private getMealTypesForCount(mealsPerDay: number): string[] {
    if (mealsPerDay === 1) {
      return ['dinner'];
    } else if (mealsPerDay === 2) {
      return ['lunch', 'dinner'];
    } else {
      return ['breakfast', 'lunch', 'dinner'];
    }
  }
}
