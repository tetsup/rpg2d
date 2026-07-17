import { cn } from '@editor/lib/utils';

type ColorSwatchProps = {
  color: string;
  className?: string;
};

export function ColorSwatch({ color, className }: ColorSwatchProps) {
  return (
    <div className={cn('relative size-8 overflow-hidden rounded border', className)}>
      <div
        className="
          absolute inset-0
          bg-[conic-gradient(#777_25%,#999_0_50%,#777_0_75%,#999_0)]
          bg-[length:8px_8px]
        "
      />
      <div className="absolute inset-0" style={{ backgroundColor: color }} />
    </div>
  );
}
