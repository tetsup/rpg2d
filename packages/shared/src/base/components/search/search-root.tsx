import type { ComponentProps } from 'react';
import { cn } from '@base/lib/utils';

export type SearchRootProps = ComponentProps<'div'>;

export function SearchRoot({ className, ...props }: SearchRootProps) {
  return <div className={cn('flex h-full min-h-0 flex-col overflow-hidden rounded-md border', className)} {...props} />;
}
