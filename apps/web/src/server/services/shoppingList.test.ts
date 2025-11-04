import type { PrismaClient } from '@prisma/client';
import { describe, expect, it, beforeEach } from 'vitest';
import { ShoppingListService } from './shoppingList';
import { mockPrismaClient } from '~/test/mocks';

describe('ShoppingListService', () => {
  const service = new ShoppingListService(mockPrismaClient as unknown as PrismaClient);

  beforeEach(() => {
    mockPrismaClient.shoppingListItem.updateMany.mockReset();
  });

  it('updates all items matching the given category', async () => {
    mockPrismaClient.shoppingListItem.updateMany.mockResolvedValue({ count: 2 });

    await service.updateCategoryChecked('list-1', 'protein', true);

    expect(mockPrismaClient.shoppingListItem.updateMany).toHaveBeenCalledWith({
      where: {
        shoppingListId: 'list-1',
        ingredient: {
          category: 'protein',
        },
      },
      data: { checked: true },
    });
  });

  it("updates items without an ingredient when the category is 'other'", async () => {
    mockPrismaClient.shoppingListItem.updateMany.mockResolvedValue({ count: 3 });

    await service.updateCategoryChecked('list-1', 'other', false);

    expect(mockPrismaClient.shoppingListItem.updateMany).toHaveBeenCalledWith({
      where: {
        shoppingListId: 'list-1',
        OR: [
          { ingredientId: null },
          {
            ingredient: {
              category: 'other',
            },
          },
        ],
      },
      data: { checked: false },
    });
  });
});
