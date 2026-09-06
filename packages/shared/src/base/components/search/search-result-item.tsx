import { cn } from '@base/lib/utils';

type SearchResultItemProps = React.ComponentProps<'div'>;

export function SearchResultItem({ className, ...props }: SearchResultItemProps) {
  return <div className={cn('min-w-0', className)} {...props} />;
}
