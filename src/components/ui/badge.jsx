import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-md border-2 border-transparent px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wide transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-[var(--color-secondary)] text-white',
        primary: 'bg-[var(--color-primary)] text-white',
        secondary: 'bg-[var(--bg-muted)] text-[var(--text-main)] border-[var(--border-flat)]',
        success: 'bg-[var(--color-secondary-bg)] text-[var(--color-secondary-hover)] border-[var(--color-secondary)]',
        warning: 'bg-[var(--color-accent-bg)] text-[var(--color-accent-hover)] border-[var(--color-accent)]',
        destructive: 'bg-[var(--color-danger-bg)] text-[var(--color-danger-hover)] border-[var(--color-danger)]',
        outline: 'text-[var(--text-muted)] border-[var(--border-flat)]'
      }
    },
    defaultVariants: { variant: 'default' }
  }
);

function Badge({ className, variant, ...props }) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
