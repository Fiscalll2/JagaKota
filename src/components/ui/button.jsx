import React from 'react';
import { cva } from 'class-variance-authority';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer min-h-[40px] px-4 py-2',
  {
    variants: {
      variant: {
        default: 'bg-[var(--color-secondary)] text-white shadow hover:bg-[var(--color-secondary-hover)]',
        primary: 'bg-[var(--color-primary)] text-white shadow hover:bg-[var(--color-primary-hover)]',
        destructive: 'bg-[var(--color-danger)] text-white shadow-sm hover:bg-[var(--color-danger-hover)]',
        outline: 'border-2 border-[var(--border-flat)] bg-[var(--bg-card)] text-[var(--text-main)] shadow-xs hover:bg-[var(--bg-muted)]',
        secondary: 'bg-[var(--bg-muted)] text-[var(--text-main)] hover:bg-[var(--bg-subtle)]',
        ghost: 'text-[var(--text-main)] hover:bg-[var(--bg-muted)]',
        link: 'text-[var(--color-primary)] underline-offset-4 hover:underline min-h-0 px-0'
      },
      size: {
        default: 'min-h-[40px] px-4 py-2',
        sm: 'min-h-[36px] rounded-md px-3 text-xs',
        lg: 'min-h-[44px] rounded-md px-6',
        icon: 'min-h-[40px] min-w-[40px] p-0'
      }
    },
    defaultVariants: { variant: 'default', size: 'default' }
  }
);

function Button({ className, variant, size, asChild = false, ...props }) {
  const Comp = asChild ? Slot : 'button';
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export { Button, buttonVariants };
