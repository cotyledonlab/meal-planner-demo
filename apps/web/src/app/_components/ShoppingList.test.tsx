import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

interface TestShoppingListItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  checked: boolean;
}

const invalidateMock = vi.fn().mockResolvedValue(undefined);
const cancelMock = vi.fn().mockResolvedValue(undefined);
let toggleShouldFail = false;

const baseItems: TestShoppingListItem[] = [
  {
    id: 'veg-1',
    name: 'Onions',
    quantity: 150,
    unit: 'g',
    category: 'vegetables',
    checked: false,
  },
  {
    id: 'veg-2',
    name: 'Carrots',
    quantity: 100,
    unit: 'g',
    category: 'vegetables',
    checked: false,
  },
  {
    id: 'prot-1',
    name: 'Eggs',
    quantity: 2,
    unit: 'pcs',
    category: 'protein',
    checked: false,
  },
];

function createMutationMock(
  type: 'toggle' | 'category'
): (handlers?: {
  onMutate?: (variables: any) => Promise<void> | void;
  onError?: (error: unknown, variables: any, context: any) => void;
  onSuccess?: (data: any, variables: any, context: any) => void;
  onSettled?: (data: any, error: unknown, variables: any, context: any) => void;
}) => { mutateAsync: (variables: any) => Promise<{ success: true }> } {
  return (handlers) => ({
    mutateAsync: async (variables: any) => {
      const context = (await handlers?.onMutate?.(variables)) ?? undefined;

      if (type === 'toggle' && toggleShouldFail) {
        handlers?.onError?.(new Error('failure'), variables, context);
        handlers?.onSettled?.(undefined, new Error('failure'), variables, context);
        throw new Error('failure');
      }

      handlers?.onSuccess?.({ success: true }, variables, context);
      handlers?.onSettled?.({ success: true }, null, variables, context);
      return { success: true };
    },
  });
}

vi.mock('next-auth/react', () => ({
  useSession: () => ({
    data: { user: { id: 'user-001', role: 'basic' } },
    status: 'authenticated',
  }),
}));

vi.mock('~/trpc/react', () => ({
  api: {
    useUtils: () => ({
      shoppingList: {
        getForPlan: {
          invalidate: invalidateMock,
          cancel: cancelMock,
        },
      },
    }),
    shoppingList: {
      toggleItemChecked: {
        useMutation: createMutationMock('toggle'),
      },
      updateCategoryChecked: {
        useMutation: createMutationMock('category'),
      },
    },
  },
}));

import ShoppingList from './ShoppingList';

const renderComponent = (items: TestShoppingListItem[] = baseItems) =>
  render(
    <ShoppingList
      items={items.map((item) => ({ ...item }))}
      shoppingListId="shopping-list-1"
      planId="plan-1"
      onComparePrices={vi.fn()}
    />
  );

beforeEach(() => {
  toggleShouldFail = false;
  vi.clearAllMocks();
});

describe('ShoppingList', () => {
  it('updates progress counts after toggling a single item', async () => {
    const user = userEvent.setup();
    renderComponent();

    expect(screen.getByText('0 of 3 items checked')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Vegetables 0 of 2 checked/i }));
    await user.click(screen.getByRole('button', { name: 'Toggle Onions' }));

    expect(await screen.findByText('1 of 3 items checked')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Vegetables 1 of 2 checked/i })).toBeInTheDocument();
    expect(invalidateMock).toHaveBeenCalledWith({ planId: 'plan-1' });
  });

  it('updates category counts after using Check All', async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.click(screen.getByRole('button', { name: /Vegetables 0 of 2 checked/i }));
    await user.click(screen.getByRole('button', { name: 'Check All' }));

    expect(await screen.findByText('2 of 3 items checked')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Vegetables 2 of 2 checked/i })).toBeInTheDocument();
    expect(invalidateMock).toHaveBeenCalledTimes(1);
  });

  it('reverts optimistic update when the toggle mutation fails', async () => {
    toggleShouldFail = true;
    const user = userEvent.setup();
    renderComponent();

    await user.click(screen.getByRole('button', { name: /Vegetables 0 of 2 checked/i }));
    await user.click(screen.getByRole('button', { name: 'Toggle Onions' }));

    await waitFor(() => expect(screen.getByText('0 of 3 items checked')).toBeInTheDocument());
    expect(invalidateMock).not.toHaveBeenCalled();
  });
});
