import { cn } from '@base/lib/utils';
import { dotColorClass } from '@base/theme/dot';
import type { Color } from '@base/theme/types';

type IndicatorDotProps = {
  color: Color;
};

export function IndicatorDot({ color }: IndicatorDotProps) {
  return (
    <span
      className={cn(
        'pointer-events-none absolute -top-0.5 -right-0.5 size-2 rounded-full ring-2 ring-background',
        dotColorClass(color)
      )}
      aria-hidden
    />
  );
}
