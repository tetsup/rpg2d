import { cn } from '@base/lib/utils';

type SyncIndicatorDotProps = {
  variant?: 'dirty' | 'draft' | 'invalid';
  className?: string;
};

const variantClass = {
  dirty: 'bg-amber-500',
  draft: 'bg-sky-500',
  invalid: 'bg-destructive',
} as const;

export function SyncIndicatorDot({ variant = 'dirty', className }: SyncIndicatorDotProps) {
  return (
    <span
      className={cn(
        'pointer-events-none absolute -top-0.5 -right-0.5 size-2 rounded-full ring-2 ring-background',
        variantClass[variant],
        className
      )}
      aria-hidden
    />
  );
}
