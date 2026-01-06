'use client';

import Link from 'next/link';
import { Activity, ImageIcon } from 'lucide-react';

import { api } from '~/trpc/react';

function formatResetTime(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'soon';
  }
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function AdminImageUsageWidget() {
  const usageQuery = api.adminImage.usage.useQuery();
  const usage = usageQuery.data;
  const isMaintenanceMode = usage?.maintenanceMode ?? false;

  return (
    <section className="mb-12 rounded-3xl border border-amber-100 bg-gradient-to-br from-amber-50 via-white to-amber-50 p-6 shadow-lg">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-800">
            <Activity className="h-4 w-4" />
            Admin guardrails
          </div>
          <h2 className="mt-3 text-2xl font-semibold text-gray-900">Image generation usage</h2>
          <p className="mt-1 text-sm text-gray-600">
            Track quota and rate limits before jumping into the generator.
          </p>
        </div>
        <Link
          href="/dashboard/admin/images"
          aria-disabled={isMaintenanceMode}
          className={`inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white px-4 py-2 text-sm font-semibold text-amber-800 shadow-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 ${
            isMaintenanceMode
              ? 'pointer-events-none opacity-60'
              : 'hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md'
          }`}
        >
          <ImageIcon className="h-4 w-4" />
          Open generator
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Daily quota</p>
          {usageQuery.isLoading ? (
            <p className="mt-2 text-sm text-gray-500">Loading usage...</p>
          ) : usageQuery.isError || !usage ? (
            <p className="mt-2 text-sm font-semibold text-red-600">Usage unavailable</p>
          ) : (
            <>
              <p className="mt-2 text-2xl font-semibold text-gray-900">
                {usage.daily.used} / {usage.daily.limit}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {usage.daily.remaining} remaining • resets at {formatResetTime(usage.daily.resetAt)}
              </p>
            </>
          )}
        </div>
        <div className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Rate limit</p>
          {usageQuery.isLoading ? (
            <p className="mt-2 text-sm text-gray-500">Loading rate limit...</p>
          ) : usageQuery.isError || !usage ? (
            <p className="mt-2 text-sm font-semibold text-red-600">Rate limit unavailable</p>
          ) : (
            <>
              <p className="mt-2 text-2xl font-semibold text-gray-900">
                {usage.rateLimit.remaining} / {usage.rateLimit.limit}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {usage.rateLimit.windowSeconds}s window • resets at{' '}
                {formatResetTime(usage.rateLimit.resetAt)}
              </p>
            </>
          )}
        </div>
      </div>

      {isMaintenanceMode ? (
        <p className="mt-4 text-xs font-semibold text-amber-700">
          Maintenance mode is enabled. Image generation is currently disabled.
        </p>
      ) : usage && (usage.daily.isFallback || usage.rateLimit.isFallback) ? (
        <p className="mt-4 text-xs font-semibold text-amber-700">
          Using fallback limits while Redis is unavailable.
        </p>
      ) : null}
    </section>
  );
}
