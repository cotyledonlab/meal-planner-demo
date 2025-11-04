'use client';

import { useSession } from 'next-auth/react';
import { useMemo } from 'react';
import { isPremiumUser } from '~/lib/auth';
import { CATEGORY_ORDER, CATEGORY_EMOJI, CATEGORY_LABELS } from '~/lib/categoryConfig';
import { api } from '~/trpc/react';
import { Disclosure } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface ShoppingListItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  ingredientId?: string;
  category: string;
  checked: boolean;
}

interface ShoppingListProps {
  items?: ShoppingListItem[];
  shoppingListId?: string;
  planId?: string;
  onComparePrices?: () => void;
}

export default function ShoppingList({
  items,
  shoppingListId,
  planId,
  onComparePrices,
}: ShoppingListProps) {
  const { data: session, status } = useSession();
  const isPremium = isPremiumUser(session?.user);
  const isLoading = status === 'loading';
  const utils = api.useUtils();

  const toggleItemMutation = api.shoppingList.toggleItemChecked.useMutation({
    onSuccess: () => {
      if (planId) {
        void utils.shoppingList.getForPlan.invalidate({ planId });
      }
    },
  });

  const updateCategoryMutation = api.shoppingList.updateCategoryChecked.useMutation({
    onSuccess: () => {
      if (planId) {
        void utils.shoppingList.getForPlan.invalidate({ planId });
      }
    },
  });

  // Group items by category
  const groupedItems = useMemo(() => {
    if (!items) return new Map();

    const groups = new Map<string, ShoppingListItem[]>();

    for (const item of items) {
      const category = item.category || 'other';
      if (!groups.has(category)) {
        groups.set(category, []);
      }
      groups.get(category)!.push(item);
    }

    // Sort by category order
    const sorted = new Map<string, ShoppingListItem[]>();
    for (const cat of CATEGORY_ORDER) {
      if (groups.has(cat)) {
        sorted.set(cat, groups.get(cat)!);
      }
    }

    // Add any remaining categories not in order
    for (const [cat, items] of groups.entries()) {
      if (!sorted.has(cat)) {
        sorted.set(cat, items);
      }
    }

    return sorted;
  }, [items]);

  const totalItems = items?.length ?? 0;
  const checkedCount = items?.filter((item) => item.checked).length ?? 0;

  const toggleItem = (itemId: string) => {
    void toggleItemMutation.mutateAsync({ itemId });
  };

  const toggleCategory = (category: string, checked: boolean) => {
    if (!shoppingListId) return;
    void updateCategoryMutation.mutateAsync({
      shoppingListId,
      category,
      checked,
    });
  };

  if (!items || items.length === 0) {
    return (
      <div className="rounded-xl bg-white p-8 text-center shadow-sm ring-1 ring-gray-200">
        <p className="text-gray-600">No shopping list available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Shopping List</h2>
        <p className="mt-1 text-sm text-gray-600">
          {checkedCount} of {totalItems} items checked
        </p>
      </div>

      {/* Grouped Shopping List */}
      <div className="space-y-4">
        {Array.from(groupedItems.entries()).map(
          ([category, categoryItems]: [string, ShoppingListItem[]]) => {
            const categoryCheckedCount = categoryItems.filter(
              (item: ShoppingListItem) => item.checked
            ).length;
            const categoryTotal = categoryItems.length;
            const allChecked = categoryCheckedCount === categoryTotal;

            return (
              <Disclosure key={category} defaultOpen={false}>
                {({ open }: { open: boolean }) => (
                  <div className="rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
                    <Disclosure.Button className="flex w-full items-center justify-between p-4 text-left transition hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{CATEGORY_EMOJI[category] ?? '📦'}</span>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {CATEGORY_LABELS[category] ?? category}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {categoryCheckedCount} of {categoryTotal} checked
                          </p>
                        </div>
                      </div>
                      <ChevronDownIcon
                        className={`h-5 w-5 text-gray-500 transition-transform ${
                          open ? 'rotate-180' : ''
                        }`}
                      />
                    </Disclosure.Button>

                    <Disclosure.Panel className="border-t border-gray-200 p-4">
                      {/* Category actions */}
                      <div className="mb-4 flex gap-2">
                        <button
                          onClick={() => toggleCategory(category, true)}
                          disabled={allChecked}
                          className="rounded-lg bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
                        >
                          Check All
                        </button>
                        <button
                          onClick={() => toggleCategory(category, false)}
                          disabled={categoryCheckedCount === 0}
                          className="rounded-lg bg-gray-50 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
                        >
                          Uncheck All
                        </button>
                      </div>

                      {/* Items list */}
                      <ul className="space-y-2">
                        {categoryItems.map((item: ShoppingListItem) => {
                          const isChecked = item.checked;
                          return (
                            <li key={item.id} className="flex items-center gap-3">
                              <button
                                onClick={() => toggleItem(item.id)}
                                className={`flex h-11 w-11 min-w-[44px] items-center justify-center rounded-lg border-2 transition ${
                                  isChecked
                                    ? 'border-emerald-600 bg-emerald-50'
                                    : 'border-gray-300 bg-white hover:border-emerald-600'
                                }`}
                                aria-label={`Toggle ${item.name}`}
                              >
                                {isChecked && (
                                  <svg
                                    className="h-6 w-6 text-emerald-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={3}
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                )}
                              </button>
                              <label
                                className={`flex-1 cursor-pointer text-base transition ${
                                  isChecked ? 'text-gray-400 line-through' : 'text-gray-700'
                                }`}
                              >
                                {item.quantity > 0 && (
                                  <span className="font-semibold">
                                    {item.quantity} {item.unit}{' '}
                                  </span>
                                )}
                                {item.name}
                              </label>
                            </li>
                          );
                        })}
                      </ul>
                    </Disclosure.Panel>
                  </div>
                )}
              </Disclosure>
            );
          }
        )}
      </div>

      {/* CTA button */}
      {onComparePrices && (
        <div className="text-center">
          <button
            onClick={onComparePrices}
            disabled={isLoading}
            className="rounded-full bg-emerald-600 px-8 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:cursor-not-allowed disabled:bg-emerald-300"
          >
            {isPremium ? 'Compare Prices' : 'Compare Prices (Premium Preview)'}
          </button>
          <p className="mt-3 text-sm text-gray-500">
            {isPremium
              ? 'See real-time price comparisons across stores'
              : 'See how much you could save at different stores'}
          </p>
        </div>
      )}
    </div>
  );
}
