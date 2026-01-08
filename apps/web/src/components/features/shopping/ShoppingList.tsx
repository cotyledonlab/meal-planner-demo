'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ShoppingBag, Check } from 'lucide-react';
import { isPremiumUser } from '~/lib/auth';
import { CATEGORY_ORDER, CATEGORY_EMOJI, CATEGORY_LABELS } from '~/lib/categoryConfig';
import { api } from '~/trpc/react';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card } from '~/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '~/components/ui/accordion';
import { EmptyState } from '~/components/shared/EmptyState';
import { cn } from '~/lib/utils';

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
  planId: string;
  onComparePrices?: () => void;
}

type BudgetEstimateMode = 'cheap' | 'standard' | 'premium';
type BudgetEstimateConfidence = 'high' | 'medium' | 'low';

const budgetModeLabels: Record<BudgetEstimateMode, string> = {
  cheap: 'Cheap',
  standard: 'Standard',
  premium: 'Premium',
};

const confidenceLabels: Record<BudgetEstimateConfidence, string> = {
  high: 'High confidence',
  medium: 'Medium confidence',
  low: 'Low confidence',
};

const confidenceClasses: Record<BudgetEstimateConfidence, string> = {
  high: 'bg-emerald-100 text-emerald-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-rose-100 text-rose-700',
};

export function ShoppingList({ planId, onComparePrices }: ShoppingListProps) {
  const { data: session, status } = useSession();
  const isPremium = isPremiumUser(session?.user);
  const isLoading = status === 'loading';
  const utils = api.useUtils();

  // Fetch shopping list data
  const { data: shoppingList } = api.shoppingList.getForPlan.useQuery(
    { planId },
    { enabled: !!planId }
  );

  const items = useMemo(() => shoppingList?.items ?? [], [shoppingList?.items]);
  const shoppingListId = shoppingList?.id;
  const itemsRef = useRef(items);
  const budgetEstimate = shoppingList?.budgetEstimate;
  const availableModes = (budgetEstimate?.modes ?? [
    'cheap',
    'standard',
    'premium',
  ]) as BudgetEstimateMode[];
  const [selectedMode, setSelectedMode] = useState<BudgetEstimateMode>('standard');
  const activeMode = availableModes.includes(selectedMode)
    ? selectedMode
    : (availableModes[0] ?? 'standard');
  const estimateValue = budgetEstimate?.totals?.[activeMode];
  const isEstimateLocked = budgetEstimate?.locked !== false;
  const confidence = (budgetEstimate?.confidence ?? 'low') as BudgetEstimateConfidence;
  const missingItemCount = budgetEstimate?.missingItemCount ?? 0;

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const toggleItemMutation = api.shoppingList.toggleItemChecked.useMutation({
    async onMutate(variables) {
      if (!variables?.itemId) return { previousItems: itemsRef.current };
      await utils.shoppingList.getForPlan.cancel({ planId }).catch(() => undefined);

      const previousItems = itemsRef.current;
      const previousData = utils.shoppingList.getForPlan.getData({ planId });

      utils.shoppingList.getForPlan.setData({ planId }, (old) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((item) =>
            item.id === variables.itemId ? { ...item, checked: !item.checked } : item
          ),
        };
      });

      return { previousItems, previousData };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousData) {
        utils.shoppingList.getForPlan.setData({ planId }, context.previousData);
      }
    },
    onSuccess: () => {
      void utils.shoppingList.getForPlan.invalidate({ planId });
    },
  });

  const updateCategoryMutation = api.shoppingList.updateCategoryChecked.useMutation({
    async onMutate(variables) {
      if (!variables?.category) return { previousItems: itemsRef.current };
      await utils.shoppingList.getForPlan.cancel({ planId }).catch(() => undefined);

      const previousItems = itemsRef.current;
      const previousData = utils.shoppingList.getForPlan.getData({ planId });

      utils.shoppingList.getForPlan.setData({ planId }, (old) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((item) =>
            item.category === variables.category ? { ...item, checked: variables.checked } : item
          ),
        };
      });

      return { previousItems, previousData };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousData) {
        utils.shoppingList.getForPlan.setData({ planId }, context.previousData);
      }
    },
    onSuccess: () => {
      void utils.shoppingList.getForPlan.invalidate({ planId });
    },
  });

  // Group items by category
  const groupedItems = useMemo(() => {
    if (!items.length) return new Map<string, ShoppingListItem[]>();

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

    // Add remaining categories
    for (const [cat, itemsList] of groups.entries()) {
      if (!sorted.has(cat)) {
        sorted.set(cat, itemsList);
      }
    }

    return sorted;
  }, [items]);

  const totalItems = items.length;
  const checkedCount = items.filter((item) => item.checked).length;

  const toggleItem = (itemId: string) => {
    toggleItemMutation.mutateAsync({ itemId }).catch(() => undefined);
  };

  const toggleCategory = (category: string, checked: boolean) => {
    if (!shoppingListId) return;
    updateCategoryMutation
      .mutateAsync({
        shoppingListId,
        category,
        checked,
      })
      .catch(() => undefined);
  };

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<ShoppingBag className="h-8 w-8" />}
        iconColor="blue"
        title="Your shopping list is empty"
        description="This shouldn't happen! Your meal plan should have generated a shopping list. Try creating a new meal plan or contact support if the problem persists."
        actionLabel="Create new plan"
        actionHref="/planner"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Sticky Header */}
      <Card className="sticky top-0 z-10 p-4 sm:p-6">
        <h2 className="text-xl font-semibold text-gray-900">Shopping List</h2>
        <p className="mt-1 text-sm text-gray-600">
          {checkedCount} of {totalItems} items checked
        </p>
      </Card>

      <Card className="p-4 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900">Budget estimate</h3>
              {isEstimateLocked && (
                <Badge
                  variant="secondary"
                  className="bg-amber-100 text-amber-700 hover:bg-amber-100"
                >
                  Premium
                </Badge>
              )}
            </div>
            <p className="mt-1 text-sm text-gray-600">
              {isEstimateLocked
                ? 'Unlock cheap, standard, and premium estimates for your list.'
                : 'Estimates use baseline ingredient pricing.'}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {availableModes.map((mode) => {
            const isActive = activeMode === mode;
            return (
              <Button
                key={mode}
                type="button"
                size="sm"
                variant={isActive ? 'default' : 'outline'}
                onClick={() => setSelectedMode(mode)}
                disabled={isEstimateLocked}
                className={cn(
                  !isActive && 'border-gray-200 text-gray-700',
                  isEstimateLocked && 'cursor-not-allowed'
                )}
              >
                {budgetModeLabels[mode]}
              </Button>
            );
          })}
        </div>

        <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p
              className={cn(
                'text-3xl font-semibold',
                isEstimateLocked ? 'text-gray-300' : 'text-gray-900'
              )}
            >
              {estimateValue != null ? `€${estimateValue.toFixed(2)}` : '€—'}
            </p>
            <p className="text-sm text-gray-600">{budgetModeLabels[activeMode]} estimate</p>
          </div>
          {!isEstimateLocked && (
            <Badge
              className={cn(
                'h-fit border border-transparent bg-transparent',
                confidenceClasses[confidence]
              )}
            >
              {confidenceLabels[confidence]}
            </Badge>
          )}
        </div>

        {isEstimateLocked ? (
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-600">
              Upgrade to see mode totals, confidence, and missing-item coverage.
            </p>
            <Button asChild variant="premium" size="sm" className="w-full sm:w-auto">
              <Link href="/#pricing">Upgrade to Premium</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-3 space-y-1 text-sm text-gray-600">
            <p>
              {missingItemCount === 0
                ? 'All items matched to baseline pricing.'
                : `${missingItemCount} item${
                    missingItemCount === 1 ? '' : 's'
                  } missing baseline data.`}
            </p>
            <p className="text-xs text-gray-500">
              Estimates are based on ingredient category baselines.
            </p>
          </div>
        )}
      </Card>

      {/* Grouped Shopping List */}
      <Accordion type="multiple" className="space-y-4">
        {Array.from(groupedItems.entries()).map(([category, categoryItems]) => {
          const categoryCheckedCount = categoryItems.filter((item) => item.checked).length;
          const categoryTotal = categoryItems.length;
          const allChecked = categoryCheckedCount === categoryTotal;

          return (
            <AccordionItem
              key={category}
              value={category}
              className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 border-0 sm:rounded-xl"
            >
              <AccordionTrigger className="flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-4 text-left transition hover:bg-gray-50 hover:no-underline sm:rounded-lg sm:px-5 sm:py-4 min-h-[60px]">
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
              </AccordionTrigger>

              <AccordionContent className="border-t border-gray-200 p-4 sm:p-5 pt-4">
                {/* Category actions */}
                <div className="mb-4 flex flex-wrap gap-2 sm:gap-3">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => toggleCategory(category, true)}
                    disabled={allChecked}
                    className="flex-1 sm:flex-initial"
                  >
                    Check All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleCategory(category, false)}
                    disabled={categoryCheckedCount === 0}
                    className="flex-1 sm:flex-initial"
                  >
                    Uncheck All
                  </Button>
                </div>

                {/* Items list */}
                <ul className="space-y-3 sm:space-y-2">
                  {categoryItems.map((item) => {
                    const isChecked = item.checked;
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => toggleItem(item.id)}
                          className={cn(
                            'flex w-full items-center gap-4 rounded-3xl border border-gray-200 bg-gray-50 px-4 py-4 text-left transition hover:border-emerald-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 sm:rounded-xl sm:px-5',
                            isChecked && 'border-emerald-500 bg-emerald-50'
                          )}
                          aria-label={`Toggle ${item.name}`}
                          aria-pressed={isChecked}
                        >
                          <span
                            className={cn(
                              'flex h-12 w-12 min-h-[52px] min-w-[52px] items-center justify-center rounded-2xl border-2 transition sm:h-11 sm:w-11 sm:min-h-[48px] sm:min-w-[48px]',
                              isChecked
                                ? 'border-emerald-600 bg-emerald-100 text-emerald-600'
                                : 'border-gray-300 bg-white text-transparent'
                            )}
                            aria-hidden="true"
                          >
                            <Check className="h-6 w-6" strokeWidth={3} />
                          </span>
                          <span
                            className={cn(
                              'flex-1 text-base leading-6',
                              isChecked ? 'text-gray-600 line-through' : 'text-gray-700'
                            )}
                          >
                            {item.quantity > 0 && (
                              <span className="font-semibold">
                                {item.quantity} {item.unit}{' '}
                              </span>
                            )}
                            {item.name}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      {/* CTA button */}
      {onComparePrices && (
        <div className="text-center">
          <Button onClick={onComparePrices} disabled={isLoading} className="w-full sm:w-auto">
            {isPremium ? 'Compare Store Estimates' : 'Compare Store Estimates (Preview)'}
          </Button>
          <p className="mt-3 text-sm text-gray-700">
            {isPremium
              ? 'See estimated totals across stores based on baseline pricing'
              : 'Preview how estimates compare across stores'}
          </p>
        </div>
      )}
    </div>
  );
}

export default ShoppingList;
