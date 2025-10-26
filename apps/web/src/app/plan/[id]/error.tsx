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
      <div className="max-w-md rounded-xl bg-white p-8 text-center shadow-lg ring-1 ring-gray-200">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <svg
            className="h-6 w-6 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
        <h2 className="mt-4 text-lg font-semibold text-gray-900">Failed to load meal plan</h2>
        <p className="mt-2 text-sm text-gray-600">{error.message}</p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={() => window.history.back()}
            className="rounded-full border border-gray-300 bg-white px-6 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
          >
            Go Back
          </button>
          <button
            onClick={reset}
            className="rounded-full bg-emerald-600 px-6 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Try Again
          </button>
        </div>
      </div>
    </main>
  );
}
