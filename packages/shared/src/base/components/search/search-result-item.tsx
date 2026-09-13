import { cn } from '@base/lib/utils';

type SearchResultItemProps = React.ComponentProps<'div'>;

export function SearchResultItem({ children, className, ...props }: SearchResultItemProps) {
  return (
    <div className={cn('flex items-center w-full min-h-8', className)} {...props}>
      <span className="w-full">{children}</span>
    </div>
  );
}
