/* eslint-disable @typescript-eslint/no-unsafe-return */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PlanGenerator } from './planGenerator';
import type { PrismaClient } from '@prisma/client';

describe('PlanGenerator', () => {
  let mockPrismaClient: any;
  let planGenerator: PlanGenerator;

  beforeEach(() => {
    // Create a fresh mock Prisma client for each test
    mockPrismaClient = {
      user: {
        findUnique: vi.fn(),
      },
      recipe: {
        findMany: vi.fn(),
      },
      mealPlan: {
        create: vi.fn(),
      },
      mealPlanItem: {
        createMany: vi.fn(),
      },
      $transaction: vi.fn(),
    };

    planGenerator = new PlanGenerator(mockPrismaClient as unknown as PrismaClient);
  });

  describe('dietary filtering', () => {
    it('should filter recipes by vegetarian preference', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'basic',
        emailVerified: null,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockRecipes = [
        {
          id: 'recipe-1',
          title: 'Veggie Dinner',
          minutes: 30,
          calories: 400,
          isVegetarian: true,
          isDairyFree: false,
          mealTypes: ['dinner'],
          servingsDefault: 4,
          instructionsMd: '# Test',
          imageUrl: null,
          ingredients: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaClient.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaClient.recipe.findMany.mockResolvedValue(mockRecipes);
      mockPrismaClient.$transaction.mockImplementation(async (callback: any) => {
        const mockTx = {
          mealPlan: {
            create: vi.fn().mockResolvedValue({
              id: 'plan-1',
              userId: 'user-1',
              startDate: new Date(),
              days: 3,
              createdAt: new Date(),
            }),
          },
          mealPlanItem: {
            createMany: vi.fn().mockResolvedValue({ count: 3 }),
          },
        };
        return await callback(mockTx);
      });

      await planGenerator.generatePlan({
        userId: 'user-1',
        isVegetarian: true,
        days: 3,
      });

      expect(mockPrismaClient.recipe.findMany).toHaveBeenCalledWith({
        where: {
          isVegetarian: true,
        },
        include: {
          ingredients: {
            include: {
              ingredient: true,
            },
          },
        },
      });
    });

    it('should filter recipes by dairy-free preference', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'basic',
        emailVerified: null,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockRecipes = [
        {
          id: 'recipe-1',
          title: 'Dairy-Free Dinner',
          minutes: 30,
          calories: 400,
          isVegetarian: false,
          isDairyFree: true,
          mealTypes: ['dinner'],
          servingsDefault: 4,
          instructionsMd: '# Test',
          imageUrl: null,
          ingredients: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaClient.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaClient.recipe.findMany.mockResolvedValue(mockRecipes);
      mockPrismaClient.$transaction.mockImplementation(async (callback: any) => {
        const mockTx = {
          mealPlan: {
            create: vi.fn().mockResolvedValue({
              id: 'plan-1',
              userId: 'user-1',
              startDate: new Date(),
              days: 3,
              createdAt: new Date(),
            }),
          },
          mealPlanItem: {
            createMany: vi.fn().mockResolvedValue({ count: 3 }),
          },
        };
        return await callback(mockTx);
      });

      await planGenerator.generatePlan({
        userId: 'user-1',
        isDairyFree: true,
        days: 3,
      });

      expect(mockPrismaClient.recipe.findMany).toHaveBeenCalledWith({
        where: {
          isDairyFree: true,
        },
        include: {
          ingredients: {
            include: {
              ingredient: true,
            },
          },
        },
      });
    });

    it('should filter recipes by both vegetarian and dairy-free preferences', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'basic',
        emailVerified: null,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockRecipes = [
        {
          id: 'recipe-1',
          title: 'Vegan Dinner',
          minutes: 30,
          calories: 400,
          isVegetarian: true,
          isDairyFree: true,
          mealTypes: ['dinner'],
          servingsDefault: 4,
          instructionsMd: '# Test',
          imageUrl: null,
          ingredients: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaClient.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaClient.recipe.findMany.mockResolvedValue(mockRecipes);
      mockPrismaClient.$transaction.mockImplementation(async (callback: any) => {
        const mockTx = {
          mealPlan: {
            create: vi.fn().mockResolvedValue({
              id: 'plan-1',
              userId: 'user-1',
              startDate: new Date(),
              days: 3,
              createdAt: new Date(),
            }),
          },
          mealPlanItem: {
            createMany: vi.fn().mockResolvedValue({ count: 3 }),
          },
        };
        return await callback(mockTx);
      });

      await planGenerator.generatePlan({
        userId: 'user-1',
        isVegetarian: true,
        isDairyFree: true,
        days: 3,
      });

      expect(mockPrismaClient.recipe.findMany).toHaveBeenCalledWith({
        where: {
          isVegetarian: true,
          isDairyFree: true,
        },
        include: {
          ingredients: {
            include: {
              ingredient: true,
            },
          },
        },
      });
    });
  });

  describe('meal type selection', () => {
    it('should generate only dinner for 1 meal per day', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'basic',
        emailVerified: null,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockRecipes = [
        {
          id: 'recipe-1',
          title: 'Dinner Recipe',
          minutes: 30,
          calories: 400,
          isVegetarian: false,
          isDairyFree: false,
          mealTypes: ['dinner'],
          servingsDefault: 4,
          instructionsMd: '# Test',
          imageUrl: null,
          ingredients: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaClient.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaClient.recipe.findMany.mockResolvedValue(mockRecipes);

      let capturedMealPlanItems: any[] = [];
      mockPrismaClient.$transaction.mockImplementation(async (callback: any) => {
        const mockTx = {
          mealPlan: {
            create: vi.fn().mockResolvedValue({
              id: 'plan-1',
              userId: 'user-1',
              startDate: new Date(),
              days: 3,
              createdAt: new Date(),
            }),
          },
          mealPlanItem: {
            createMany: vi.fn().mockImplementation((data: any) => {
              capturedMealPlanItems = data.data;
              return Promise.resolve({ count: data.data.length });
            }),
          },
        };
        return await callback(mockTx);
      });

      await planGenerator.generatePlan({
        userId: 'user-1',
        mealsPerDay: 1,
        days: 3,
      });

      // Should have 3 meal items (1 meal per day for 3 days)
      expect(capturedMealPlanItems).toHaveLength(3);
      // All should be dinner
      expect(capturedMealPlanItems.every((item) => item.mealType === 'dinner')).toBe(true);
    });

    it('should generate lunch and dinner for 2 meals per day', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'basic',
        emailVerified: null,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockRecipes = [
        {
          id: 'recipe-1',
          title: 'Lunch Recipe',
          minutes: 20,
          calories: 350,
          isVegetarian: false,
          isDairyFree: false,
          mealTypes: ['lunch'],
          servingsDefault: 4,
          instructionsMd: '# Test',
          imageUrl: null,
          ingredients: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'recipe-2',
          title: 'Dinner Recipe',
          minutes: 30,
          calories: 400,
          isVegetarian: false,
          isDairyFree: false,
          mealTypes: ['dinner'],
          servingsDefault: 4,
          instructionsMd: '# Test',
          imageUrl: null,
          ingredients: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaClient.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaClient.recipe.findMany.mockResolvedValue(mockRecipes);

      let capturedMealPlanItems: any[] = [];
      mockPrismaClient.$transaction.mockImplementation(async (callback: any) => {
        const mockTx = {
          mealPlan: {
            create: vi.fn().mockResolvedValue({
              id: 'plan-1',
              userId: 'user-1',
              startDate: new Date(),
              days: 3,
              createdAt: new Date(),
            }),
          },
          mealPlanItem: {
            createMany: vi.fn().mockImplementation((data: any) => {
              capturedMealPlanItems = data.data;
              return Promise.resolve({ count: data.data.length });
            }),
          },
        };
        return await callback(mockTx);
      });

      await planGenerator.generatePlan({
        userId: 'user-1',
        mealsPerDay: 2,
        days: 3,
      });

      // Should have 6 meal items (2 meals per day for 3 days)
      expect(capturedMealPlanItems).toHaveLength(6);
      // Should have both lunch and dinner
      const mealTypes = capturedMealPlanItems.map((item) => item.mealType);
      expect(mealTypes.filter((type) => type === 'lunch')).toHaveLength(3);
      expect(mealTypes.filter((type) => type === 'dinner')).toHaveLength(3);
    });

    it('should generate breakfast, lunch, and dinner for 3 meals per day', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'premium',
        emailVerified: null,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockRecipes = [
        {
          id: 'recipe-1',
          title: 'Breakfast Recipe',
          minutes: 15,
          calories: 300,
          isVegetarian: false,
          isDairyFree: false,
          mealTypes: ['breakfast'],
          servingsDefault: 4,
          instructionsMd: '# Test',
          imageUrl: null,
          ingredients: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'recipe-2',
          title: 'Lunch Recipe',
          minutes: 20,
          calories: 350,
          isVegetarian: false,
          isDairyFree: false,
          mealTypes: ['lunch'],
          servingsDefault: 4,
          instructionsMd: '# Test',
          imageUrl: null,
          ingredients: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'recipe-3',
          title: 'Dinner Recipe',
          minutes: 30,
          calories: 400,
          isVegetarian: false,
          isDairyFree: false,
          mealTypes: ['dinner'],
          servingsDefault: 4,
          instructionsMd: '# Test',
          imageUrl: null,
          ingredients: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaClient.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaClient.recipe.findMany.mockResolvedValue(mockRecipes);

      let capturedMealPlanItems: any[] = [];
      mockPrismaClient.$transaction.mockImplementation(async (callback: any) => {
        const mockTx = {
          mealPlan: {
            create: vi.fn().mockResolvedValue({
              id: 'plan-1',
              userId: 'user-1',
              startDate: new Date(),
              days: 7,
              createdAt: new Date(),
            }),
          },
          mealPlanItem: {
            createMany: vi.fn().mockImplementation((data: any) => {
              capturedMealPlanItems = data.data;
              return Promise.resolve({ count: data.data.length });
            }),
          },
        };
        return await callback(mockTx);
      });

      await planGenerator.generatePlan({
        userId: 'user-1',
        mealsPerDay: 3,
        days: 7,
      });

      // Should have 21 meal items (3 meals per day for 7 days)
      expect(capturedMealPlanItems).toHaveLength(21);
      // Should have breakfast, lunch, and dinner
      const mealTypes = capturedMealPlanItems.map((item) => item.mealType);
      expect(mealTypes.filter((type) => type === 'breakfast')).toHaveLength(7);
      expect(mealTypes.filter((type) => type === 'lunch')).toHaveLength(7);
      expect(mealTypes.filter((type) => type === 'dinner')).toHaveLength(7);
    });
  });

  describe('household size', () => {
    it('should use default household size of 2', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'basic',
        emailVerified: null,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockRecipes = [
        {
          id: 'recipe-1',
          title: 'Dinner Recipe',
          minutes: 30,
          calories: 400,
          isVegetarian: false,
          isDairyFree: false,
          mealTypes: ['dinner'],
          servingsDefault: 4,
          instructionsMd: '# Test',
          imageUrl: null,
          ingredients: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaClient.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaClient.recipe.findMany.mockResolvedValue(mockRecipes);

      let capturedMealPlanItems: any[] = [];
      mockPrismaClient.$transaction.mockImplementation(async (callback: any) => {
        const mockTx = {
          mealPlan: {
            create: vi.fn().mockResolvedValue({
              id: 'plan-1',
              userId: 'user-1',
              startDate: new Date(),
              days: 3,
              createdAt: new Date(),
            }),
          },
          mealPlanItem: {
            createMany: vi.fn().mockImplementation((data: any) => {
              capturedMealPlanItems = data.data;
              return Promise.resolve({ count: data.data.length });
            }),
          },
        };
        return await callback(mockTx);
      });

      await planGenerator.generatePlan({
        userId: 'user-1',
        days: 3,
        // No householdSize specified, should default to 2
      });

      // All meals should have servings = 2
      expect(capturedMealPlanItems.every((item) => item.servings === 2)).toBe(true);
    });

    it('should use specified household size', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'basic',
        emailVerified: null,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockRecipes = [
        {
          id: 'recipe-1',
          title: 'Dinner Recipe',
          minutes: 30,
          calories: 400,
          isVegetarian: false,
          isDairyFree: false,
          mealTypes: ['dinner'],
          servingsDefault: 4,
          instructionsMd: '# Test',
          imageUrl: null,
          ingredients: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaClient.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaClient.recipe.findMany.mockResolvedValue(mockRecipes);

      let capturedMealPlanItems: any[] = [];
      mockPrismaClient.$transaction.mockImplementation(async (callback: any) => {
        const mockTx = {
          mealPlan: {
            create: vi.fn().mockResolvedValue({
              id: 'plan-1',
              userId: 'user-1',
              startDate: new Date(),
              days: 3,
              createdAt: new Date(),
            }),
          },
          mealPlanItem: {
            createMany: vi.fn().mockImplementation((data: any) => {
              capturedMealPlanItems = data.data;
              return Promise.resolve({ count: data.data.length });
            }),
          },
        };
        return await callback(mockTx);
      });

      await planGenerator.generatePlan({
        userId: 'user-1',
        householdSize: 5,
        days: 3,
      });

      // All meals should have servings = 5
      expect(capturedMealPlanItems.every((item) => item.servings === 5)).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should throw error when no recipes exist', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'basic',
        emailVerified: null,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaClient.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaClient.recipe.findMany.mockResolvedValue([]);

      await expect(
        planGenerator.generatePlan({
          userId: 'user-1',
          days: 3,
        })
      ).rejects.toThrow('No recipes available. Please seed the database first.');
    });

    it('should throw error when requesting vegetarian meals but no vegetarian recipes exist for a meal type', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'basic',
        emailVerified: null,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Only vegetarian breakfast recipes, no vegetarian lunch/dinner
      const mockRecipes = [
        {
          id: 'recipe-1',
          title: 'Veggie Breakfast',
          minutes: 15,
          calories: 300,
          isVegetarian: true,
          isDairyFree: false,
          mealTypes: ['breakfast'],
          servingsDefault: 4,
          instructionsMd: '# Test',
          imageUrl: null,
          ingredients: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaClient.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaClient.recipe.findMany.mockResolvedValue(mockRecipes);

      // Request 2 meals per day (lunch + dinner) but only breakfast recipes exist
      await expect(
        planGenerator.generatePlan({
          userId: 'user-1',
          isVegetarian: true,
          mealsPerDay: 2,
          days: 3,
        })
      ).rejects.toThrow('No recipes available for lunch. Please add more recipes to the database.');
    });

    it('should throw error when requesting dairy-free meals but no dairy-free recipes exist for a meal type', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'basic',
        emailVerified: null,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Only dairy-free breakfast recipes, no dairy-free dinner
      const mockRecipes = [
        {
          id: 'recipe-1',
          title: 'Dairy-Free Breakfast',
          minutes: 15,
          calories: 300,
          isVegetarian: false,
          isDairyFree: true,
          mealTypes: ['breakfast'],
          servingsDefault: 4,
          instructionsMd: '# Test',
          imageUrl: null,
          ingredients: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaClient.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaClient.recipe.findMany.mockResolvedValue(mockRecipes);

      // Request 1 meal per day (dinner) but only breakfast recipes exist
      await expect(
        planGenerator.generatePlan({
          userId: 'user-1',
          isDairyFree: true,
          mealsPerDay: 1, // dinner only
          days: 3,
        })
      ).rejects.toThrow('No recipes available for dinner. Please add more recipes to the database.');
    });

    it('should throw error when user does not exist', async () => {
      mockPrismaClient.user.findUnique.mockResolvedValue(null);

      await expect(
        planGenerator.generatePlan({
          userId: 'nonexistent-user',
          days: 3,
        })
      ).rejects.toThrow('User not found');
    });

    it('should cap days to role limit for basic users', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'basic',
        emailVerified: null,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockRecipes = [
        {
          id: 'recipe-1',
          title: 'Dinner Recipe',
          minutes: 30,
          calories: 400,
          isVegetarian: false,
          isDairyFree: false,
          mealTypes: ['dinner'],
          servingsDefault: 4,
          instructionsMd: '# Test',
          imageUrl: null,
          ingredients: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaClient.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaClient.recipe.findMany.mockResolvedValue(mockRecipes);

      let createdPlanDays = 0;
      mockPrismaClient.$transaction.mockImplementation(async (callback: any) => {
        const mockTx = {
          mealPlan: {
            create: vi.fn().mockImplementation((data: any) => {
              createdPlanDays = data.data.days;
              return Promise.resolve({
                id: 'plan-1',
                userId: 'user-1',
                startDate: new Date(),
                days: data.data.days,
                createdAt: new Date(),
              });
            }),
          },
          mealPlanItem: {
            createMany: vi.fn().mockResolvedValue({ count: 3 }),
          },
        };
        return await callback(mockTx);
      });

      // Request 7 days but basic users should be capped at 3
      await planGenerator.generatePlan({
        userId: 'user-1',
        days: 7,
      });

      expect(createdPlanDays).toBe(3);
    });

    it('should allow premium users to request 7 days', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'premium',
        emailVerified: null,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockRecipes = [
        {
          id: 'recipe-1',
          title: 'Dinner Recipe',
          minutes: 30,
          calories: 400,
          isVegetarian: false,
          isDairyFree: false,
          mealTypes: ['dinner'],
          servingsDefault: 4,
          instructionsMd: '# Test',
          imageUrl: null,
          ingredients: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaClient.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaClient.recipe.findMany.mockResolvedValue(mockRecipes);

      let createdPlanDays = 0;
      mockPrismaClient.$transaction.mockImplementation(async (callback: any) => {
        const mockTx = {
          mealPlan: {
            create: vi.fn().mockImplementation((data: any) => {
              createdPlanDays = data.data.days;
              return Promise.resolve({
                id: 'plan-1',
                userId: 'user-1',
                startDate: new Date(),
                days: data.data.days,
                createdAt: new Date(),
              });
            }),
          },
          mealPlanItem: {
            createMany: vi.fn().mockResolvedValue({ count: 7 }),
          },
        };
        return await callback(mockTx);
      });

      await planGenerator.generatePlan({
        userId: 'user-1',
        days: 7,
      });

      expect(createdPlanDays).toBe(7);
    });
  });
});
