'use client';

import Link from 'next/link';
import { Sparkles, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '~/components/ui/dialog';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import { cn } from '~/lib/utils';
import { api } from '~/trpc/react';
import storesData from '~/mockData/stores.json';

interface StorePrice {
  store: string;
  totalPrice: number;
}

interface PriceComparisonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planId: string;
  isPremium: boolean;
}

export function PriceComparisonModal({
  open,
  onOpenChange,
  planId,
  isPremium,
}: PriceComparisonModalProps) {
  // Fetch estimate data for premium users
  const { data: shoppingListData, isLoading } = api.shoppingList.getForMealPlan.useQuery(
    { mealPlanId: planId },
    { enabled: open && isPremium }
  );

  const storePrices = shoppingListData?.storePrices ?? null;
  const cheapestStore = shoppingListData?.cheapestStore ?? null;

  // Calculate savings relative to cheapest store for estimate data
  const calculateSavings = (prices: StorePrice[]) => {
    if (!prices.length) return [];
    const cheapest = prices[0]!; // Already sorted by price
    return prices.map((price) => ({
      ...price,
      savings: price.totalPrice - cheapest.totalPrice,
      isCheapest: price.store === cheapest.store,
    }));
  };

  const pricesWithSavings = storePrices ? calculateSavings(storePrices) : null;

  // Render premium user content with estimate data
  if (isPremium) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Price Comparison</DialogTitle>
            <DialogDescription>
              Compare estimated totals across supermarkets for your shopping list
            </DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
              <span className="ml-2 text-gray-600">Loading estimates...</span>
            </div>
          ) : pricesWithSavings && pricesWithSavings.length > 0 ? (
            <>
              {/* Price comparison table */}
              <div className="mt-4 overflow-hidden rounded-xl border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[520px]">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Store
                        </th>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                          Estimated Total
                        </th>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                          Compared to Best
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {pricesWithSavings.map((store) => (
                        <tr key={store.store} className={cn(store.isCheapest && 'bg-emerald-50')}>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-gray-900">
                                {store.store}
                              </span>
                              {store.isCheapest && (
                                <Badge className="bg-emerald-600 hover:bg-emerald-600">
                                  Best Value
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                            €{store.totalPrice.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-right text-sm">
                            {store.savings === 0 ? (
                              <span className="text-gray-500">—</span>
                            ) : (
                              <span className="font-semibold text-red-600">
                                +€{store.savings.toFixed(2)}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Info box */}
              {cheapestStore && (
                <div className="rounded-lg bg-emerald-50 p-4">
                  <p className="text-sm text-emerald-900">
                    💡 <strong>Best deal:</strong> Shop at {cheapestStore.store} to get the lowest
                    estimated total of €{cheapestStore.totalPrice.toFixed(2)} for your shopping
                    list!
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="py-8 text-center text-gray-600">
              <p>No estimate data available for this shopping list.</p>
              <p className="mt-2 text-sm">
                Estimates are based on available ingredient pricing baselines.
              </p>
            </div>
          )}

          <Button onClick={() => onOpenChange(false)} className="w-full">
            Close
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Price Comparison</DialogTitle>
          <DialogDescription>
            See which supermarket offers the best estimated value for your shopping list
          </DialogDescription>
        </DialogHeader>

        {/* Sample data badge */}
        <Badge
          variant="secondary"
          className="w-fit bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
        >
          <Sparkles className="h-3 w-3 mr-1" />
          Example with Sample Data
        </Badge>

        {/* Price comparison table */}
        <div className="mt-4 overflow-hidden rounded-xl border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Store</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                    Estimated Total
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                    Estimated Savings
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {storesData.map((store) => (
                  <tr key={store.name} className={cn(store.isCheapest && 'bg-emerald-50')}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">{store.name}</span>
                        {store.isCheapest && (
                          <Badge className="bg-emerald-600 hover:bg-emerald-600">Best Value</Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                      €{store.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm">
                      {store.savings === 0 ? (
                        <span className="text-gray-500">—</span>
                      ) : (
                        <span className="font-semibold text-red-600">
                          €{store.savings.toFixed(2)}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info box */}
        <div className="rounded-lg bg-emerald-50 p-4">
          <p className="text-sm text-emerald-900">
            💡 <strong>With Premium:</strong> See your full estimate breakdown and compare stores to
            save up to €{Math.abs(storesData[storesData.length - 1]?.savings ?? 0).toFixed(2)}.
          </p>
        </div>

        {/* CTA */}
        <div className="space-y-3">
          <Button asChild className="w-full">
            <Link href="/#pricing">Upgrade to Premium for Full Estimates</Link>
          </Button>
          <p className="text-center text-xs text-gray-700">
            This example uses sample data • Premium unlocks personalized estimates
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default PriceComparisonModal;
