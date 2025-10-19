import { type PrismaClient } from '@prisma/client';

interface GeneratePlanInput {
  userId: string;
  startDate?: Date;
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
    const { userId, startDate = this.getNextMonday() } = input;

    // Get user to check their role/plan limits
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Determine plan length based on user role
    const days = user.role === 'premium' ? 7 : 3;

    // Get available recipes
    const recipes = await this.prisma.recipe.findMany({
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

    // Shuffle recipes for variety (using a simple Fisher-Yates shuffle)
    const shuffledRecipes = this.shuffleArray([...recipes]);

    // Create the meal plan
    const plan = await this.prisma.mealPlan.create({
      data: {
        userId,
        startDate,
        days,
      },
    });

    // Create meal plan items
    const mealTypes = ['breakfast', 'lunch', 'dinner'];
    let recipeIndex = 0;

    for (let dayIndex = 0; dayIndex < days; dayIndex++) {
      for (const mealType of mealTypes) {
        // Cycle through recipes, wrapping around if needed
        const recipe = shuffledRecipes[recipeIndex % shuffledRecipes.length];
        if (!recipe) continue;

        await this.prisma.mealPlanItem.create({
          data: {
            planId: plan.id,
            dayIndex,
            mealType,
            recipeId: recipe.id,
            servings: recipe.servingsDefault,
          },
        });

        recipeIndex++;
      }
    }

    return {
      id: plan.id,
      userId: plan.userId,
      startDate: plan.startDate,
      days: plan.days,
      createdAt: plan.createdAt,
    };
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
}
