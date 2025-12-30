export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-emerald-50 to-white">
      <div className="text-center animate-fade-in">
        {/* Animated cooking icon */}
        <div className="relative mx-auto mb-6 h-20 w-20">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/30 animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              className="h-10 w-10 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
              <path d="M7 2v20" />
              <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
            </svg>
          </div>
        </div>

        {/* Loading text with animation */}
        <h2 className="text-xl font-bold text-gray-900">Preparing your meal plan</h2>
        <p className="mt-2 text-gray-600">This will only take a moment...</p>

        {/* Progress dots */}
        <div className="mt-6 flex justify-center gap-2">
          <span
            className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce"
            style={{ animationDelay: '0ms' }}
          />
          <span
            className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce"
            style={{ animationDelay: '150ms' }}
          />
          <span
            className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce"
            style={{ animationDelay: '300ms' }}
          />
        </div>
      </div>
    </main>
  );
}
