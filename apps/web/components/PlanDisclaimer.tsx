"use client";

type PlanDisclaimerProps = {
  message?: string;
};

/**
 * Placeholder component rendered within the plan experience.
 * Real content will be supplied when User Story 1 is implemented.
 */
export function PlanDisclaimer({ message }: PlanDisclaimerProps) {
  return (
    <p className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      {message ??
        'Nutrition information is provided for demonstration purposes only and does not constitute medical advice.'}
    </p>
  );
}
