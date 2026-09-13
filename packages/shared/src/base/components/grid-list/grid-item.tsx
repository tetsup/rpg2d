import { cn } from '@base/lib/utils';

type GridItemProps = React.ComponentProps<'div'>;

export function GridItem({ className, ...props }: GridItemProps) {
  return <div className={cn('min-w-0', className)} {...props} />;
}
