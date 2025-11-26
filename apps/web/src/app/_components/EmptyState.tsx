import Link from 'next/link';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  iconColor?: 'blue' | 'emerald' | 'purple' | 'amber' | 'gray';
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  actionOnClick?: () => void;
  secondaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  preview?: ReactNode;
  className?: string;
}

const colorClasses = {
  blue: 'from-blue-500 to-blue-600',
  emerald: 'from-emerald-500 to-emerald-600',
  purple: 'from-purple-500 to-purple-600',
  amber: 'from-amber-500 to-amber-600',
  gray: 'from-gray-400 to-gray-500',
};

export default function EmptyState({
  icon,
  iconColor = 'emerald',
  title,
  description,
  actionLabel,
  actionHref,
  actionOnClick,
  secondaryAction,
  preview,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50/50 p-8 text-center shadow-sm transition-all duration-200 ${className}`}
    >
      {/* Icon */}
      <div
        className={`mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${colorClasses[iconColor]} text-white shadow-lg`}
      >
        {icon}
      </div>

      {/* Title */}
      <h3 className="mb-2 text-xl font-semibold text-gray-900">{title}</h3>

      {/* Description */}
      <p className="mb-6 max-w-md text-base leading-relaxed text-gray-600">{description}</p>

      {/* Actions */}
      {(actionLabel || secondaryAction) && (
        <div className="flex flex-col gap-3 sm:flex-row">
          {actionLabel && actionHref && (
            <Link
              href={actionHref}
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-3 text-base font-semibold text-white shadow-md transition-all duration-200 hover:scale-[1.02] hover:from-emerald-700 hover:to-emerald-800 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
            >
              {actionLabel}
            </Link>
          )}
          {actionLabel && actionOnClick && !actionHref && (
            <button
              onClick={actionOnClick}
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-3 text-base font-semibold text-white shadow-md transition-all duration-200 hover:scale-[1.02] hover:from-emerald-700 hover:to-emerald-800 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
            >
              {actionLabel}
            </button>
          )}
          {secondaryAction?.href && (
            <Link
              href={secondaryAction.href}
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-6 py-3 text-base font-semibold text-gray-700 transition-all duration-200 hover:scale-[1.02] hover:border-gray-300 hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
            >
              {secondaryAction.label}
            </Link>
          )}
          {secondaryAction?.onClick && !secondaryAction.href && (
            <button
              onClick={secondaryAction.onClick}
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-6 py-3 text-base font-semibold text-gray-700 transition-all duration-200 hover:scale-[1.02] hover:border-gray-300 hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}

      {/* Preview */}
      {preview && <div className="mt-8 w-full">{preview}</div>}
    </div>
  );
}
