import type { ReactNode } from 'react';
import { cn } from '@base/lib/utils';

type PreviewCardProps = {
  label: ReactNode;
  renderImage: () => ReactNode;
  orient?: 'horizontal' | 'vertical';
  className?: string;
};

export function PreviewCard({ label, renderImage, orient = 'vertical', className }: PreviewCardProps) {
  const isHorizontal = orient === 'horizontal';

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-sm border bg-card',
        'text-card-foreground shadow-sm',
        isHorizontal ? 'flex w-full' : 'w-full',
        className
      )}
    >
      <div className={cn('bg-muted/30', isHorizontal ? 'aspect-square shrink-0' : 'aspect-square w-full')}>
        <div className="flex h-full w-full items-center justify-center">{renderImage()}</div>
      </div>

      <div
        className={cn(
          'bg-background/90 px-1 py-1',
          isHorizontal ? 'flex min-w-0 flex-1 items-center border-l' : 'border-t'
        )}
      >
        <div className="w-full truncate text-center text-xs font-medium">{label}</div>
      </div>
    </div>
  );
}
