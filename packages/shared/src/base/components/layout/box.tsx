import { cn } from '@base/lib/utils';

type BoxProps = {
  children: React.ReactNode;
  size: 'xs' | 'sm';
  variant: 'outlined' | 'none';
};

export function Box({ children, size, variant }: BoxProps) {
  return (
    <div className={cn(variant === 'outlined' ? 'rounded border' : '', `p-${size === 'sm' ? 4 : 2}`)}>{children}</div>
  );
}
