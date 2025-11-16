'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';

interface PremiumFeatureCardProps {
  title: string;
  description: string;
  icon: string | ReactNode;
  iconColor?: 'blue' | 'amber' | 'purple' | 'emerald';
  isPremiumUser: boolean;
  onPreview?: () => void;
  onLearnMore?: () => void;
  previewLabel?: string;
}

export default function PremiumFeatureCard({
  title,
  description,
  icon,
  iconColor = 'emerald',
  isPremiumUser,
  onPreview,
  onLearnMore,
  previewLabel,
}: PremiumFeatureCardProps) {
  const colorClasses = {
    emerald: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
    blue: 'bg-gradient-to-br from-blue-500 to-blue-600',
    amber: 'bg-gradient-to-br from-amber-500 to-amber-600',
    purple: 'bg-gradient-to-br from-purple-500 to-purple-600',
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-md transition-all duration-200 hover:shadow-xl hover:-translate-y-1">
      {/* Lock overlay for non-premium users */}
      {!isPremiumUser && (
        <div className="absolute right-4 top-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-400 shadow-sm">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
          <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
            Coming soon
          </span>
        </div>
      )}

      <div className="flex flex-col items-start gap-4 sm:flex-row">
        <div className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl text-white shadow-md ${colorClasses[iconColor]}`}>
          {typeof icon === 'string' ? <span className="text-2xl">{icon}</span> : icon}
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">{description}</p>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            {!isPremiumUser ? (
              <>
                <Link
                  href="/#pricing"
                  className="inline-flex w-full min-h-[44px] items-center justify-center gap-1 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 sm:w-auto"
                >
                  Go Premium
                </Link>
                {onPreview && (
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={onPreview}
                      className="inline-flex w-full min-h-[44px] items-center justify-center gap-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-500 sm:w-auto"
                      aria-label="See example of this feature with sample data"
                    >
                      See Example
                    </button>
                    {previewLabel && (
                      <p className="text-xs text-gray-500 text-center sm:text-left">
                        {previewLabel}
                      </p>
                    )}
                  </div>
                )}
              </>
            ) : (
              onLearnMore && (
                <button
                  onClick={onLearnMore}
                  className="inline-flex w-full min-h-[44px] items-center justify-center gap-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-500 sm:w-auto"
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
