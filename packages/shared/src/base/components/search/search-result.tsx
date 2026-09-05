import type { ComponentProps } from 'react';
import { cn } from '@base/lib/utils';
import { ScrollArea } from '@base/components/ui/scroll-area';

export type SearchResultProps = ComponentProps<typeof ScrollArea> & {
  size?: 'full' | 'xs' | 'sm' | 'md';
};

export function SearchResult({ size = 'full', className, children, ...props }: SearchResultProps) {
  return (
    <ScrollArea {...props}>
      <div
        className={cn(
          size === 'full' && 'flex flex-col',
          size === 'xs' && 'grid grid-cols-6 gap-2 @md:grid-cols-9',
          size === 'sm' && 'grid grid-cols-4 gap-2 @md:grid-cols-6',
          size === 'md' && 'grid grid-cols-2 gap-2 @md:grid-cols-4',
          'flex-1'
        )}
      >
        {children}
      </div>
    </ScrollArea>
  );
}
