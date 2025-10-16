'use client';

import { useState } from 'react';
import shoppingListData from '~/mockData/shoppingList.json';

interface ShoppingListProps {
  onComparePrices: () => void;
}

interface Item {
  id: string;
  name: string;
  checked: boolean;
}

export default function ShoppingList({ onComparePrices }: ShoppingListProps) {
  const [categories, setCategories] = useState(
    shoppingListData.categories.map((category) => ({
      ...category,
      items: category.items.map((item) => ({ ...item })),
    }))
  );

  const toggleItem = (categoryIndex: number, itemId: string) => {
    setCategories((prev) =>
      prev.map((category, idx) => {
        if (idx === categoryIndex) {
          return {
            ...category,
            items: category.items.map((item: Item) =>
              item.id === itemId ? { ...item, checked: !item.checked } : item
            ),
          };
        }
        return category;
      })
    );
  };

  const totalItems = categories.reduce((sum, cat) => sum + cat.items.length, 0);
  const checkedItems = categories.reduce(
    (sum, cat) => sum + cat.items.filter((item: Item) => item.checked).length,
    0
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-5xl px-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold text-gray-900 sm:text-4xl">Your Shopping List</h1>
          <p className="mt-2 text-base text-gray-600">
            {checkedItems} of {totalItems} items checked
          </p>
        </div>

        {/* Shopping list */}
        <div className="space-y-6">
          {categories.map((category, categoryIndex) => (
            <div
              key={category.name}
              className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200"
            >
              <h2 className="text-lg font-semibold text-gray-900">{category.name}</h2>
              <ul className="mt-4 space-y-3">
                {category.items.map((item: Item) => (
                  <li key={item.id} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id={item.id}
                      checked={item.checked}
                      onChange={() => toggleItem(categoryIndex, item.id)}
                      className="h-5 w-5 rounded border-gray-300 text-emerald-600 transition focus:ring-2 focus:ring-emerald-600"
                    />
                    <label
                      htmlFor={item.id}
                      className={`flex-1 cursor-pointer text-sm ${
                        item.checked ? 'text-gray-400 line-through' : 'text-gray-700'
                      }`}
                    >
                      {item.name}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* CTA button */}
        <div className="mt-12 text-center">
          <button
            onClick={onComparePrices}
            className="rounded-full bg-emerald-600 px-8 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
          >
            Compare Prices (Premium Preview)
          </button>
          <p className="mt-3 text-sm text-gray-500">
            See how much you could save at different stores
          </p>
        </div>
      </div>
    </div>
  );
}
