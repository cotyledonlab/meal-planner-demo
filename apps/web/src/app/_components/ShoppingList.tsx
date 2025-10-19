'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { isPremiumUser } from '~/lib/auth';

interface ShoppingListItem {
  name: string;
  quantity: number;
  unit: string;
  ingredientId?: string;
}

interface ShoppingListProps {
  items?: ShoppingListItem[];
  planId?: string;
  onComparePrices?: () => void;
}

export default function ShoppingList({ items, onComparePrices }: ShoppingListProps) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const { data: session, status } = useSession();
  const isPremium = isPremiumUser(session?.user);
  const isLoading = status === 'loading';

  if (!items || items.length === 0) {
    return (
      <div className="rounded-xl bg-white p-8 text-center shadow-sm ring-1 ring-gray-200">
        <p className="text-gray-600">No shopping list available</p>
      </div>
    );
  }

  const toggleItem = (itemKey: string) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemKey)) {
        next.delete(itemKey);
      } else {
        next.add(itemKey);
      }
      return next;
    });
  };

  const totalItems = items.length;
  const checkedCount = checkedItems.size;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Shopping List</h2>
        <p className="mt-1 text-sm text-gray-600">
          {checkedCount} of {totalItems} items checked
        </p>
      </div>

      {/* Shopping list */}
      <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <ul className="space-y-3">
          {items.map((item, index) => {
            const itemKey = `${item.name}-${index}`;
            const isChecked = checkedItems.has(itemKey);
            return (
              <li key={itemKey} className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id={itemKey}
                  checked={isChecked}
                  onChange={() => toggleItem(itemKey)}
                  className="h-5 w-5 rounded border-gray-300 text-emerald-600 transition focus:ring-2 focus:ring-emerald-600"
                />
                <label
                  htmlFor={itemKey}
                  className={`flex-1 cursor-pointer text-sm ${
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
