import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '~/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-base font-semibold transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-emerald-600 text-white shadow-md hover:bg-emerald-700 hover:shadow-lg active:scale-[0.98]',
        destructive: 'bg-destructive text-white shadow-sm hover:bg-destructive/90',
        outline:
          'border-2 border-gray-200 bg-white text-gray-700 shadow-sm hover:border-gray-300 hover:bg-gray-50',
        secondary: 'bg-white text-emerald-700 ring-2 ring-emerald-600 hover:bg-emerald-50',
        ghost: 'hover:bg-gray-100 text-gray-700',
        link: 'text-emerald-600 underline-offset-4 hover:underline',
        premium:
          'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg shadow-emerald-600/30 hover:from-emerald-700 hover:to-emerald-800',
      },
      size: {
        default: 'min-h-[48px] px-6 py-3.5',
        sm: 'min-h-[36px] rounded-full px-4 py-2 text-sm',
        lg: 'min-h-[56px] rounded-full px-8 py-4 text-lg',
        icon: 'min-h-[44px] min-w-[44px] rounded-full p-2.5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
