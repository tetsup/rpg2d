import { useCallback, useEffect, useRef, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react';
import { cn } from '@editor/lib/utils';
import {
  drawCompositeImages,
  getCompositeCanvasSize,
  type ImagePixelData,
} from '@editor/lib/pixel-render';

type PixelCanvasProps = {
  images?: ImagePixelData[];
  image?: ImagePixelData;
  activeToken?: string;
  cellSize?: number;
  showGrid?: boolean;
  onPaint?: (x: number, y: number) => void;
  emptyLabel?: string;
  className?: string;
};

function getPixelCoordinates(
  canvas: HTMLCanvasElement,
  clientX: number,
  clientY: number
): { x: number; y: number } | null {
  const rect = canvas.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return null;

  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const x = Math.floor((clientX - rect.left) * scaleX);
  const y = Math.floor((clientY - rect.top) * scaleY);
  return { x, y };
}

export function PixelCanvas({
  images,
  image,
  activeToken,
  cellSize = 1,
  showGrid = true,
  onPaint,
  emptyLabel,
  className,
}: PixelCanvasProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const displayImages = image ? [image] : (images ?? []);
  const { width, height } = getCompositeCanvasSize(displayImages);
  const editable = image != null && onPaint != null;
  const resolvedCellSize = Math.max(cellSize, 0.01);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || displayImages.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawCompositeImages(ctx, displayImages, width, height);
  }, [displayImages, width, height]);

  const paintAt = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = ref.current;
      if (!canvas || !onPaint) return;

      const coords = getPixelCoordinates(canvas, clientX, clientY);
      if (!coords) return;

      onPaint(coords.x, coords.y);
    },
    [onPaint]
  );

  const handlePointerDown = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!editable) return;
    isDrawingRef.current = true;
    if ('setPointerCapture' in event.currentTarget) {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    paintAt(event.clientX, event.clientY);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!editable || !isDrawingRef.current) return;
    paintAt(event.clientX, event.clientY);
  };

  const stopDrawing = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    if (
      'hasPointerCapture' in event.currentTarget &&
      event.currentTarget.hasPointerCapture(event.pointerId)
    ) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  if (displayImages.length === 0) {
    return (
      <div
        className={cn(
          'flex min-h-40 items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 text-sm text-muted-foreground',
          className
        )}
      >
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div
        className="pixel-editor-surface"
        style={
          {
            width: width * resolvedCellSize,
            height: height * resolvedCellSize,
            '--cell-size': `${resolvedCellSize}px`,
          } as CSSProperties
        }
      >
        <canvas
          ref={ref}
          width={width}
          height={height}
          className={cn(
            'block size-full [image-rendering:pixelated]',
            editable && 'cursor-crosshair'
          )}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={stopDrawing}
          onPointerCancel={stopDrawing}
          onPointerLeave={stopDrawing}
          aria-label={editable ? `pixel-canvas-${activeToken ?? 'edit'}` : undefined}
        />
        {showGrid ? (
          <>
            <div className="pixel-editor-checker" aria-hidden />
            <div className="pixel-editor-grid-lines" aria-hidden />
          </>
        ) : null}
      </div>
    </div>
  );
}
