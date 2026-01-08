'use client';

import Link from 'next/link';
import { Sparkles } from 'lucide-react';
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
import storesData from '~/mockData/stores.json';

interface PremiumPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PremiumPreviewModal({ open, onOpenChange }: PremiumPreviewModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Budget Estimate Preview</DialogTitle>
          <DialogDescription>
            Compare estimated totals across supermarkets for your shopping list
          </DialogDescription>
        </DialogHeader>

        {/* Premium badge */}
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
                    Total
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
            💡 <strong>With Premium:</strong> Compare estimates and spot where you could save up to
            €{Math.abs(storesData[storesData.length - 1]?.savings ?? 0).toFixed(2)} this week.
          </p>
        </div>

        {/* CTA */}
        <div className="space-y-3">
          <Button asChild className="w-full">
            <Link href="/#pricing">Upgrade to Premium for full estimates</Link>
          </Button>
          <p className="text-center text-xs text-gray-700">
            This example uses sample data • Premium unlocks full budget estimates
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default PremiumPreviewModal;
