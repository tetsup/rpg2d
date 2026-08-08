import type { ReactNode } from 'react';
import { cn } from '@base/lib/utils';

type AlertStackProps = {
  children: ReactNode;
  className?: string;
};

export function AlertStack({ children, className }: AlertStackProps) {
  return (
    <div
      className={cn(
        'pointer-events-none fixed top-4 left-1/2 z-50 flex w-full max-w-3xl -translate-x-1/2 flex-col gap-2 px-4',
        className
      )}
    >
      {children}
    </div>
  );
}
