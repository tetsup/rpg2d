import type { ComponentProps } from 'react';
import { ScrollArea } from '@base/components/ui/scroll-area';
import { cn } from '@base/lib/utils';

export type SearchResultProps = ComponentProps<typeof ScrollArea>;

export function SearchResult({ className, children, ...props }: SearchResultProps) {
  return (
    <ScrollArea className={cn('flex-1', className)} {...props}>
      <div className="flex flex-col">{children}</div>
    </ScrollArea>
  );
}
