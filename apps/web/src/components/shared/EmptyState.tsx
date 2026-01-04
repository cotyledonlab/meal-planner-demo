import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { cn } from "~/lib/utils";

interface EmptyStateProps {
  icon: ReactNode;
  iconColor?: "blue" | "emerald" | "purple" | "amber" | "gray";
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
  blue: "from-blue-500 to-blue-600",
  emerald: "from-emerald-500 to-emerald-600",
  purple: "from-purple-500 to-purple-600",
  amber: "from-amber-500 to-amber-600",
  gray: "from-gray-400 to-gray-500",
};

export function EmptyState({
  icon,
  iconColor = "emerald",
  title,
  description,
  actionLabel,
  actionHref,
  actionOnClick,
  secondaryAction,
  preview,
  className,
}: EmptyStateProps) {
  return (
    <Card
      className={cn(
        "flex flex-col items-center justify-center bg-gradient-to-br from-white to-gray-50/50 p-8 text-center",
        className
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg",
          colorClasses[iconColor]
        )}
      >
        {icon}
      </div>

      {/* Title */}
      <h3 className="mb-2 text-xl font-semibold text-gray-900">{title}</h3>

      {/* Description */}
      <p className="mb-6 max-w-md text-base leading-relaxed text-gray-600">
        {description}
      </p>

      {/* Actions */}
      {(actionLabel ?? secondaryAction) && (
        <div className="flex flex-col gap-3 sm:flex-row">
          {actionLabel && actionHref && (
            <Button variant="premium" asChild>
              <Link href={actionHref}>{actionLabel}</Link>
            </Button>
          )}
          {actionLabel && actionOnClick && !actionHref && (
            <Button variant="premium" onClick={actionOnClick}>
              {actionLabel}
            </Button>
          )}
          {secondaryAction?.href && (
            <Button variant="outline" asChild>
              <Link href={secondaryAction.href}>{secondaryAction.label}</Link>
            </Button>
          )}
          {secondaryAction?.onClick && !secondaryAction.href && (
            <Button variant="outline" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}

      {/* Preview */}
      {preview && <div className="mt-8 w-full">{preview}</div>}
    </Card>
  );
}

export default EmptyState;
