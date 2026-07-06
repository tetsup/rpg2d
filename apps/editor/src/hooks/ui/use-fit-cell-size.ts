import { useEffect, useState } from 'react';
import { computeFitCellSize } from '@editor/lib/paint-editor/zoom';

type UseFitCellSizeParams = {
  container: HTMLElement | null;
  canvasWidth: number;
  canvasHeight: number;
};

export function useFitCellSize({ container, canvasWidth, canvasHeight }: UseFitCellSizeParams) {
  const [fitCellSize, setFitCellSize] = useState(1);

  useEffect(() => {
    if (container == null || canvasWidth <= 0 || canvasHeight <= 0) return;
    const update = () => {
      setFitCellSize(computeFitCellSize(canvasWidth, canvasHeight, container.clientWidth, container.clientHeight));
    };
    update();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(update);
    observer.observe(container);
    return () => {
      observer.disconnect();
    };
  }, [container, canvasWidth, canvasHeight]);

  return fitCellSize;
}
