import { useEffect, useRef, type HTMLAttributes } from 'react';
import { cn } from '@editor/lib/utils';
import {
  drawCompositeImages,
  getCompositeCanvasSize,
  type ImagePixelData,
} from '@editor/lib/pixel-render';

type PixelCanvasProps = {
  images?: ImagePixelData[];
  emptyLabel?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, 'children'>;

export function PixelCanvas({ images = [], emptyLabel, className, ...props }: PixelCanvasProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const { width, height } = getCompositeCanvasSize(images);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || images.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawCompositeImages(ctx, images, width, height);
  }, [images, width, height]);

  if (images.length === 0) {
    return (
      <div
        className={cn(
          'flex min-h-40 items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 text-sm text-muted-foreground',
          className
        )}
        {...props}
      >
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center justify-center', className)} {...props}>
      <canvas
        ref={ref}
        width={width}
        height={height}
        className="max-h-full max-w-full [image-rendering:pixelated]"
      />
    </div>
  );
}
