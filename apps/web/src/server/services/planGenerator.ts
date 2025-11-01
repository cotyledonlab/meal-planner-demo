import { type PrismaClient } from '@prisma/client';
import { createLogger } from '~/lib/logger';

interface GeneratePlanInput {
  userId: string;
  startDate?: Date;
  days?: number;
  mealsPerDay?: number;
  householdSize?: number;
  isVegetarian?: boolean;
  isDairyFree?: boolean;
  dislikes?: string | null;
}

interface MealPlanOutput {
  id: string;
  userId: string;
  startDate: Date;
  days: number;
  createdAt: Date;
}

export class PlanGenerator {
  private log = createLogger('PlanGenerator');

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
      dislikes = null,
    } = input;

    // Get user to check their role/plan limits
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Role-based day limit validation
    const maxDays = user.role === 'premium' ? 7 : 3;
    if (requestedDays > maxDays) {
      throw new Error(
        `Your plan is limited to ${maxDays} days. Upgrade to premium for longer plans.`
      );
    }
    const days = requestedDays;

    // Determine which meal types to include based on mealsPerDay
    const mealTypes = this.getMealTypesForCount(mealsPerDay);
    const dislikeTerms = this.parseDislikes(dislikes);

    // Get available recipes with dietary filters
    const recipesMatchingDiet = await this.prisma.recipe.findMany({
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

    if (recipesMatchingDiet.length === 0) {
      throw new Error('No recipes available. Please seed the database first.');
    }

    const eligibleRecipes =
      dislikeTerms.length === 0
        ? recipesMatchingDiet
        : recipesMatchingDiet.filter((recipe) =>
            this.recipePassesDislikes(recipe.ingredients, dislikeTerms)
          );

    if (eligibleRecipes.length === 0) {
      throw new Error('No recipes match your preferences. Please adjust and try again.');
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
        // Filter recipes that are appropriate for this meal type
        const appropriateRecipes = eligibleRecipes.filter((recipe) => {
          const mealTypesArray = Array.isArray(recipe.mealTypes)
            ? recipe.mealTypes.filter((type): type is string => typeof type === 'string')
            : [];
          return mealTypesArray.includes(mealType);
        });

        this.log.debug(
          {
            dayIndex: dayIndex + 1,
            mealType,
            count: appropriateRecipes.length,
          },
          'Eligible recipes filtered'
        );

        if (appropriateRecipes.length === 0) {
          throw new Error(
            `No recipes available for ${mealType}. Please add more recipes to the database.`
          );
        }

        // Shuffle and pick a random recipe for variety
        const shuffled = this.shuffleArray(appropriateRecipes);
        const recipe = shuffled[0];
        if (!recipe) continue;

        this.log.debug(
          {
            dayIndex: dayIndex + 1,
            mealType,
            recipeId: recipe.id,
            recipeTitle: recipe.title,
            recipeMealTypes: recipe.mealTypes,
          },
          'Recipe assigned to meal slot'
        );

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
    }
    if (mealsPerDay === 2) {
      return ['lunch', 'dinner'];
    }
    if (mealsPerDay === 3) {
      return ['breakfast', 'lunch', 'dinner'];
    }

    return ['breakfast', 'lunch', 'dinner'];
  }

  private parseDislikes(dislikes: string | null | undefined): string[] {
    if (!dislikes) return [];
    return dislikes
      .split(',')
      .map((entry) => entry.trim().toLowerCase())
      .filter((entry) => entry.length > 0);
  }

  private recipePassesDislikes(
    ingredients: Array<{ ingredient: { name: string | null } }>,
    dislikeTerms: string[]
  ): boolean {
    if (dislikeTerms.length === 0) return true;

    const ingredientNames = ingredients
      .map((ri) => ri.ingredient?.name?.toLowerCase() ?? null)
      .filter((name): name is string => Boolean(name));

    if (ingredientNames.length === 0) return true;

    return !dislikeTerms.some((term) => ingredientNames.some((name) => name.includes(term)));
  }
}
