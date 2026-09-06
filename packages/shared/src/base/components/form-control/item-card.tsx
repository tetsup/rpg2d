import type { ReactNode } from 'react';
import { cn } from '@base/lib/utils';

type ItemCardProps = {
  children: ReactNode;
  orient?: 'horizontal' | 'vertical';
  className?: string;
};

export function ItemCard({ children, orient = 'vertical', className }: ItemCardProps) {
  const isHorizontal = orient === 'horizontal';

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-sm border bg-card',
        'text-card-foreground shadow-sm',
        'hover:bg-accent hover:text-accent-foreground',
        isHorizontal ? 'flex w-full' : 'w-full',
        className
      )}
    >
      {children}
    </div>
  );
}
