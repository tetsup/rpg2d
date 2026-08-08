import type { ReactNode } from 'react';
import { cn } from '@base/lib/utils';

type ListItemProps = {
  itemLabel: string;
  thumbnail?: ReactNode | null;
  size?: 'sm' | 'md';
};

const thumbnailSizeClass = {
  sm: 'size-8',
  md: 'size-10',
} as const;

export function ListItem({ itemLabel, thumbnail, size = 'sm' }: ListItemProps) {
  if (!thumbnail) return <span className="truncate">{itemLabel}</span>;

  return (
    <span className="flex min-w-0 items-center gap-2">
      <span
        className={cn(
          'flex shrink-0 items-center justify-center overflow-hidden rounded-sm bg-muted',
          thumbnailSizeClass[size]
        )}
      >
        {thumbnail}
      </span>
      <span className="truncate">{itemLabel}</span>
    </span>
  );
}
