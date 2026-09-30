import React from 'react';
import { cn } from '../../lib/utils';

function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-[var(--bg-muted)]', className)}
      {...props}
    />
  );
}

function Separator({ className, orientation = 'horizontal', ...props }) {
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cn(
        'shrink-0 bg-[var(--border-flat)]',
        orientation === 'horizontal' ? 'h-[2px] w-full' : 'h-full w-[2px]',
        className
      )}
      {...props}
    />
  );
}

export { Skeleton, Separator };
