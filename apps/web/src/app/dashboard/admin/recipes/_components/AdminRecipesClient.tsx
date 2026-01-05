'use client';

import Link from 'next/link';

import type { RouterOutputs } from '~/trpc/react';
import { api } from '~/trpc/react';

type RecipeListItem = RouterOutputs['adminRecipe']['list'][number];

interface AdminRecipesClientProps {
  initialRecipes: RecipeListItem[];
}

function formatDate(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat('en-IE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

const STATUS_STYLES: Record<string, string> = {
  DRAFT: 'bg-amber-100 text-amber-800',
  PENDING_REVIEW: 'bg-blue-100 text-blue-800',
  APPROVED: 'bg-emerald-100 text-emerald-800',
  REJECTED: 'bg-red-100 text-red-800',
  ARCHIVED: 'bg-gray-200 text-gray-700',
};

export default function AdminRecipesClient({ initialRecipes }: AdminRecipesClientProps) {
  const { data = [] } = api.adminRecipe.list.useQuery(
    { limit: 50 },
    {
      initialData: initialRecipes,
      refetchOnWindowFocus: false,
    }
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Recipe builder</h1>
          <p className="mt-2 text-sm text-gray-600">
            Create, review, and publish recipes for the meal planning catalog.
          </p>
        </div>
        <Link
          href="/dashboard/admin/recipes/new"
          className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          New recipe
        </Link>
      </div>

      <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-100 text-left text-sm">
          <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500">
            <tr>
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Meal types</th>
              <th className="px-6 py-4">Updated</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                  No recipes yet. Create your first draft.
                </td>
              </tr>
            ) : (
              data.map((recipe) => (
                <tr key={recipe.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-gray-900">{recipe.title}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                        STATUS_STYLES[recipe.status] ?? 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {recipe.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{recipe.mealTypes.join(', ')}</td>
                  <td className="px-6 py-4 text-gray-600">{formatDate(recipe.updatedAt)}</td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/dashboard/admin/recipes/${recipe.id}`}
                      className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
