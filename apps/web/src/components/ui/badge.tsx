import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '~/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-emerald-100 text-emerald-700 hover:bg-emerald-100/80',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive: 'border-transparent bg-destructive text-white hover:bg-destructive/80',
        outline: 'border-gray-200 text-foreground',
        mealType:
          'border-transparent bg-emerald-600 text-white uppercase tracking-wide text-[10px] px-2 py-0.5',
        // Difficulty badges
        easy: 'border-transparent bg-green-100 text-green-700',
        medium: 'border-transparent bg-amber-100 text-amber-700',
        hard: 'border-transparent bg-red-100 text-red-700',
        // Diet badges
        vegetarian: 'border-transparent bg-green-50 text-green-700',
        vegan: 'border-transparent bg-emerald-50 text-emerald-700',
        dairyFree: 'border-transparent bg-blue-50 text-blue-700',
        glutenFree: 'border-transparent bg-purple-50 text-purple-700',
        // Premium badge
        premium: 'border-transparent bg-amber-100 text-amber-700',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
