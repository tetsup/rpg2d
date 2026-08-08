import type { ComponentProps } from 'react';
import { cn } from '@base/lib/utils';

export type SearchResultEmptyProps = ComponentProps<'div'>;

export function SearchResultEmpty({ className, ...props }: SearchResultEmptyProps) {
  return <div className={cn('text-muted-foreground p-4 text-center text-sm', className)} {...props} />;
}
