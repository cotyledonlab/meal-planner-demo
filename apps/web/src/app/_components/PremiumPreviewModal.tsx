'use client';

import { useEffect } from 'react';
import storesData from '~/mockData/stores.json';

interface PremiumPreviewModalProps {
  onClose: () => void;
}

export default function PremiumPreviewModal({ onClose }: PremiumPreviewModalProps) {
  const cheapestStore = storesData.find((store) => store.isCheapest);

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-0 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="flex h-full w-full items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex h-full w-full flex-col overflow-y-auto rounded-none bg-white p-6 shadow-xl sm:h-auto sm:max-h-[90vh] sm:max-w-2xl sm:rounded-2xl sm:p-8">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h2 id="modal-title" className="text-2xl font-semibold text-gray-900">
                Price Comparison
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                See which supermarket offers the best value for your shopping list
              </p>
            </div>
            <button
              onClick={onClose}
              className="ml-4 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full p-2.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
              aria-label="Close modal"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Premium badge */}
          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
            <span>✨</span>
            <span>Example with Sample Data</span>
          </div>

          {/* Price comparison table */}
          <div className="mt-6 overflow-hidden rounded-xl border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Store
                    </th>
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
                    <tr key={store.name} className={store.isCheapest ? 'bg-emerald-50' : ''}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-900">{store.name}</span>
                          {store.isCheapest && (
                            <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-semibold text-white">
                              Best Value
                            </span>
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
          <div className="mt-6 rounded-lg bg-emerald-50 p-4">
            <p className="text-sm text-emerald-900">
              💡 <strong>With Premium:</strong> Shop at {cheapestStore?.name} this week and save up
              to €{Math.abs(storesData[storesData.length - 1]?.savings ?? 0).toFixed(2)} compared to
              other stores!
            </p>
          </div>

          {/* CTA */}
          <div className="mt-8 space-y-3">
            <a
              href="/#pricing"
              className="block w-full min-h-[48px] rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white text-center shadow-sm transition hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
            >
              Upgrade to Premium for Real Prices
            </a>
            <p className="text-center text-xs text-gray-500">
              This example uses sample data • Get actual supermarket prices with Premium
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
