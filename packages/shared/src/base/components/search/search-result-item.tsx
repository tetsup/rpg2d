import { cn } from '@base/lib/utils';

type SearchResultItemProps = React.ComponentProps<'div'>;

export function SearchResultItem({ className, ...props }: SearchResultItemProps) {
  return (
    <div
      className={cn(
        `
          flex items-center gap-2
          px-3 py-2
          hover:bg-accent
          hover:text-accent-foreground
        `,
        className
      )}
      {...props}
    />
  );
}
