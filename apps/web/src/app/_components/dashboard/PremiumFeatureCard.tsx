'use client';

import Link from 'next/link';

interface PremiumFeatureCardProps {
  title: string;
  description: string;
  icon: string;
  isPremiumUser: boolean;
  onPreview?: () => void;
  onLearnMore?: () => void;
}

export default function PremiumFeatureCard({
  title,
  description,
  icon,
  isPremiumUser,
  onPreview,
  onLearnMore,
}: PremiumFeatureCardProps) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md">
      {/* Lock overlay for non-premium users */}
      {!isPremiumUser && (
        <div className="absolute right-4 top-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
        </div>
      )}

      {/* Coming soon badge for premium users */}
      {isPremiumUser && (
        <div className="absolute right-4 top-4">
          <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
            Coming soon
          </span>
        </div>
      )}

      <div className="flex flex-col items-start gap-4 sm:flex-row">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-2xl">
          {icon}
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="mt-1 text-sm text-gray-600">{description}</p>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            {!isPremiumUser ? (
              <>
                <Link
                  href="/#pricing"
                  className="inline-flex w-full min-h-[44px] items-center justify-center gap-1 rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 sm:w-auto"
                >
                  Go Premium
                </Link>
                {onPreview && (
                  <button
                    onClick={onPreview}
                    className="inline-flex w-full min-h-[44px] items-center justify-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-500 sm:w-auto"
                  >
                    Preview
                  </button>
                )}
              </>
            ) : (
              onLearnMore && (
                <button
                  onClick={onLearnMore}
                  className="inline-flex w-full min-h-[44px] items-center justify-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-500 sm:w-auto"
                >
                  Learn more
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
