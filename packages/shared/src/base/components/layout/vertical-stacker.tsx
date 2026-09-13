import { cn } from '@base/lib/utils';

type VerticalStackerProps = {
  size?: 'xs' | 'sm';
  divide?: boolean;
  children: React.ReactNode;
};

export function VerticalStacker({ size = 'sm', divide = false, children }: VerticalStackerProps) {
  return (
    <div className={cn(`space-y-${size === 'sm' ? 4 : 2} gap-${size === 'sm' ? 2 : 1}`, divide && 'divide-y')}>
      {children}
    </div>
  );
}
