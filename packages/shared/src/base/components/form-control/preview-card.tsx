import type { ReactNode } from 'react';
import { cn } from '@base/lib/utils';

type PreviewCardProps = {
  label: string;
  renderImage: () => ReactNode;
  className?: string;
};

export function PreviewCard({ label, renderImage, className }: PreviewCardProps) {
  return (
    <div
      className={cn(
        'group relative w-full overflow-hidden rounded-sm border bg-card',
        'text-card-foreground shadow-sm',
        className
      )}
    >
      <div className="aspect-square w-full bg-muted/30">
        <div className="flex h-full w-full items-center justify-center">{renderImage()}</div>
      </div>

      <div className={cn('bg-background/90', 'border-t px-1 py-1')}>
        <div className="truncate text-xs font-medium text-center">{label}</div>
      </div>
    </div>
  );
}
