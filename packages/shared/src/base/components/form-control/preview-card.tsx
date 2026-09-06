import type { ReactNode } from 'react';
import { cn } from '@base/lib/utils';
import { ItemCard } from './item-card';

type PreviewCardProps = {
  label: ReactNode;
  renderImage: () => ReactNode;
  orient?: 'horizontal' | 'vertical';
  className?: string;
};

export function PreviewCard({ label, renderImage, orient = 'vertical', className }: PreviewCardProps) {
  const isHorizontal = orient === 'horizontal';

  return (
    <ItemCard orient={orient} className={className}>
      <div className={cn('bg-muted/30', isHorizontal ? 'aspect-square shrink-0' : 'aspect-square w-full')}>
        <div className="flex h-full w-full items-center justify-center p-2">{renderImage()}</div>
      </div>

      <div
        className={cn(
          isHorizontal ? 'flex min-w-0 flex-1 items-center border-l' : 'border-t bg-background/90 px-1 py-1'
        )}
      >
        <div className="w-full truncate text-center text-xs font-medium">{label}</div>
      </div>
    </ItemCard>
  );
}
