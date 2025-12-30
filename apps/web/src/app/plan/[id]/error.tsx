'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-emerald-50 to-white px-6">
      <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-xl ring-1 ring-gray-100 animate-fade-in">
        {/* Friendly error icon */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50">
          <svg
            className="h-8 w-8 text-amber-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Friendly heading */}
        <h2 className="mt-5 text-xl font-bold text-gray-900">Oops! We hit a snag</h2>

        {/* Helpful message */}
        <p className="mt-3 text-base text-gray-600">
          We couldn&apos;t load your meal plan this time. Don&apos;t worry — your data is safe.
        </p>

        {/* Technical details (collapsed) */}
        {error.message && (
          <details className="mt-4 rounded-lg bg-gray-50 p-3 text-left">
            <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
              Technical details
            </summary>
            <p className="mt-2 text-xs text-gray-500 font-mono break-words">{error.message}</p>
          </details>
        )}

        {/* Helpful suggestions */}
        <div className="mt-6 rounded-lg bg-emerald-50 p-4 text-left">
          <p className="text-sm font-medium text-emerald-800">Things to try:</p>
          <ul className="mt-2 space-y-1 text-sm text-emerald-700">
            <li className="flex items-center gap-2">
              <span className="text-emerald-500">•</span>
              Check your internet connection
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-500">•</span>
              Refresh the page and try again
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-500">•</span>
              Come back in a few minutes
            </li>
          </ul>
        </div>

        {/* Action buttons */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={() => window.history.back()}
            className="min-h-[44px] rounded-full border-2 border-gray-200 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50 hover:border-gray-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
          >
            ← Go Back
          </button>
          <button
            onClick={reset}
            className="min-h-[44px] rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow-md active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
          >
            Try Again
          </button>
        </div>
      </div>
    </main>
  );
}
