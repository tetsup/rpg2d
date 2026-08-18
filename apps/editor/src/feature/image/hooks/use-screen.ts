import { PointerEventHandler, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { Point2d, Size2d } from '@sharedTypes/engine';
import { useImageData } from './use-image-data';

type Bound2d = { minX: number; minY: number; maxX: number; maxY: number };

export type GridPointerEvent = {
  grid: Point2d;
  screen: Point2d;
  originalEvent: React.PointerEvent<HTMLCanvasElement>;
};

type UseScreenProps = {
  image: ReturnType<typeof useImageData>;
  cellSize: Size2d;
};

export function useScreen({ image, cellSize }: UseScreenProps) {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState<Point2d>({ x: 0, y: 0 });
  const [viewportSize, setViewportSize] = useState<Size2d>({
    width: 0,
    height: 0,
  });

  const scaledCellSize = useMemo(
    () => ({
      width: cellSize.width * zoom,
      height: cellSize.height * zoom,
    }),
    [cellSize, zoom]
  );

  const visibleGridRect = useMemo(() => {
    const left = (0 - offset.x) / (cellSize.width * zoom);
    const top = (0 - offset.y) / (cellSize.height * zoom);
    const right = (viewportSize.width - offset.x) / (cellSize.width * zoom);
    const bottom = (viewportSize.height - offset.y) / (cellSize.height * zoom);

    return {
      minX: Math.floor(left),
      minY: Math.floor(top),
      maxX: Math.ceil(right),
      maxY: Math.ceil(bottom),
    };
  }, [viewportSize, offset, zoom, cellSize]);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const calcFitOffset = (zoom: number): Point2d => {
    const imageWidth = image.data.size.width * cellSize.width * zoom;
    const imageHeight = image.data.size.height * cellSize.height * zoom;

    return {
      x: (viewportSize.width - imageWidth) / 2,
      y: (viewportSize.height - imageHeight) / 2,
    };
  };

  const clampOffset = (offset: Point2d, zoom: number): Point2d => {
    const imageWidth = image.data.size.width * cellSize.width * zoom;
    const imageHeight = image.data.size.height * cellSize.height * zoom;
    let x = offset.x;
    let y = offset.y;

    if (imageWidth <= viewportSize.width) {
      x = (viewportSize.width - imageWidth) / 2;
    } else {
      const minX = viewportSize.width - imageWidth;
      const maxX = 0;
      x = Math.min(maxX, Math.max(minX, x));
    }

    if (imageHeight <= viewportSize.height) {
      y = (viewportSize.height - imageHeight) / 2;
    } else {
      const minY = viewportSize.height - imageHeight;
      const maxY = 0;
      y = Math.min(maxY, Math.max(minY, y));
    }

    return { x, y };
  };

  const zoomTo = (nextZoom: number) => {
    setZoom(nextZoom);
    setOffset((prev) => clampOffset(prev, nextZoom));
  };

  const zoomBy = (rate: number) => {
    setZoom((z) => z * rate);
  };

  const calcMinZoom = () => {
    const zoomX = viewportSize.width / (image.data.size.width * cellSize.width);
    const zoomY = viewportSize.height / (image.data.size.height * cellSize.height);
    return Math.min(zoomX, zoomY);
  };

  const zoomToFit = () => {
    const nextZoom = calcMinZoom();
    setZoom(nextZoom);
    setOffset(calcFitOffset(nextZoom));
  };

  const panBy = (dx: number, dy: number) => {
    setOffset((prev) =>
      clampOffset(
        {
          x: prev.x + dx,
          y: prev.y + dy,
        },
        zoom
      )
    );
  };

  const createPointerHandler =
    (handler?: (e: GridPointerEvent) => void): PointerEventHandler<HTMLCanvasElement> =>
    (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      handler?.({
        screen: {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        },
        grid: screenToGrid({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        }),
        originalEvent: e,
      });
    };

  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    ctxRef.current = canvas.getContext('2d');
  }, []);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const resize = () => {
      const { width, height } = container.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;
      setViewportSize({ width, height });
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    redraw();
  }, [viewportSize, visibleGridRect, image.data]);

  useLayoutEffect(() => {
    if (viewportSize.width === 0 || viewportSize.height === 0) return;

    zoomToFit();
  }, [viewportSize, image.data.size.width, image.data.size.height]);

  const gridToScreen = ({ x, y }: Point2d): Point2d => ({
    x: (x + 0.5) * scaledCellSize.width + offset.x,
    y: (y + 0.5) * scaledCellSize.height + offset.y,
  });

  const screenToGrid = ({ x, y }: Point2d): Point2d => ({
    x: Math.floor((x - offset.x) / scaledCellSize.width),
    y: Math.floor((y - offset.y) / scaledCellSize.height),
  });

  const drawChecker = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) => {
    const halfWidth = width / 2;
    const halfHeight = height / 2;

    ctx.fillStyle = '#777';
    ctx.fillRect(x, y, halfWidth, halfHeight);
    ctx.fillRect(x + halfWidth, y + halfHeight, halfWidth, halfHeight);

    ctx.fillStyle = '#999';
    ctx.fillRect(x + halfWidth, y, halfWidth, halfHeight);
    ctx.fillRect(x, y + halfHeight, halfWidth, halfHeight);
  };

  const drawCell = (ctx: CanvasRenderingContext2D, gridPos: Point2d) => {
    const pixel = image.getPixel(gridPos);
    if (!pixel) return;

    const fillStyle = image.getColorStyle(gridPos);
    if (!fillStyle) return;

    const center = gridToScreen(gridPos);
    const x = center.x - scaledCellSize.width / 2;
    const y = center.y - scaledCellSize.height / 2;

    drawChecker(ctx, x, y, scaledCellSize.width, scaledCellSize.height);
    ctx.fillStyle = fillStyle;
    ctx.fillRect(x, y, scaledCellSize.width, scaledCellSize.height);

    ctx.strokeStyle = '#888';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, scaledCellSize.width, scaledCellSize.height);
  };

  const intersect = (a: Bound2d, b: Bound2d): Bound2d | null => {
    const minX = Math.max(a.minX, b.minX);
    const minY = Math.max(a.minY, b.minY);
    const maxX = Math.min(a.maxX, b.maxX);
    const maxY = Math.min(a.maxY, b.maxY);
    if (minX > maxX || minY > maxY) return null;
    return { minX, minY, maxX, maxY };
  };

  const drawVisible = () => {
    const ctx = ctxRef.current;
    if (!ctx) return;

    const drawRect = intersect(image.gridBounds, visibleGridRect);
    if (!drawRect) return;

    for (let y = drawRect.minY; y <= drawRect.maxY; y++) {
      for (let x = drawRect.minX; x <= drawRect.maxX; x++) {
        drawCell(ctx, { x, y });
      }
    }
  };

  const redraw = () => {
    const ctx = ctxRef.current;
    if (!ctx) return;

    ctx.clearRect(0, 0, viewportSize.width, viewportSize.height);
    drawVisible();
  };

  const redrawCell = (gridPos: Point2d) => {
    const ctx = ctxRef.current;
    if (!ctx) return;

    drawCell(ctx, gridPos);
  };

  return {
    containerRef,
    canvasRef,
    createPointerHandler,
    zoom,
    zoomTo,
    zoomBy,
    zoomToFit,
    calcMinZoom,
    panBy,
    redrawCell,
  };
}
