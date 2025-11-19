'use client';

interface Step {
  label: string;
  status: 'completed' | 'current' | 'upcoming';
}

interface ProgressIndicatorProps {
  steps: Step[];
}

export default function ProgressIndicator({ steps }: ProgressIndicatorProps) {
  return (
    <div className="w-full">
      {/* Mobile: Simple dots */}
      <div className="flex items-center justify-center gap-2 md:hidden">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className={`h-2 rounded-full transition-all duration-300 ${
              step.status === 'completed'
                ? 'w-8 bg-emerald-600'
                : step.status === 'current'
                  ? 'w-12 bg-emerald-600'
                  : 'w-8 bg-gray-300'
            }`}
          />
        ))}
      </div>

      {/* Desktop: Full step labels */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between">
          {steps.map((step, idx) => (
            <div key={idx} className="flex flex-1 items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold transition-all duration-300 ${
                    step.status === 'completed'
                      ? 'border-emerald-600 bg-emerald-600 text-white'
                      : step.status === 'current'
                        ? 'border-emerald-600 bg-white text-emerald-600 ring-4 ring-emerald-100'
                        : 'border-gray-300 bg-white text-gray-400'
                  }`}
                >
                  {step.status === 'completed' ? (
                    <svg
                      className="h-6 w-6"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>
                <span
                  className={`mt-2 text-xs font-medium transition-colors duration-300 ${
                    step.status === 'current'
                      ? 'text-emerald-700'
                      : step.status === 'completed'
                        ? 'text-emerald-600'
                        : 'text-gray-500'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div className="mx-2 flex-1">
                  <div className="h-0.5 bg-gray-200">
                    <div
                      className={`h-full transition-all duration-500 ${
                        step.status === 'completed' ? 'w-full bg-emerald-600' : 'w-0 bg-gray-200'
                      }`}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
