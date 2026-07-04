import type { ReactNode } from 'react';
import { cn } from '@editor/lib/utils';

type DocumentListItemContentProps = {
  label: string;
  thumbnail?: ReactNode | null;
  size?: 'sm' | 'md';
};

const thumbnailSizeClass = {
  sm: 'size-8',
  md: 'size-10',
} as const;

export function DocumentListItemContent({ label, thumbnail, size = 'sm' }: DocumentListItemContentProps) {
  if (!thumbnail) {
    return <span className="truncate">{label}</span>;
  }

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
      <span className="truncate">{label}</span>
    </span>
  );
}
