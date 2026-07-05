import { useEffect, useState, type RefObject } from 'react';
import { computeFitCellSize } from '@editor/lib/paint-editor/zoom';

type UseFitCellSizeParams = {
  containerRef: RefObject<HTMLElement | null>;
  canvasWidth: number;
  canvasHeight: number;
};

export function useFitCellSize({ containerRef, canvasWidth, canvasHeight }: UseFitCellSizeParams) {
  const [fitCellSize, setFitCellSize] = useState(1);

  useEffect(() => {
    const container = containerRef.current;
    if (container == null || canvasWidth <= 0 || canvasHeight <= 0) {
      setFitCellSize(1);
      return;
    }

    const update = () => {
      setFitCellSize(
        computeFitCellSize(canvasWidth, canvasHeight, container.clientWidth, container.clientHeight)
      );
    };

    update();

    if (typeof ResizeObserver === 'undefined') {
      return;
    }

    const observer = new ResizeObserver(update);
    observer.observe(container);
    return () => observer.disconnect();
  }, [canvasHeight, canvasWidth, containerRef]);

  return fitCellSize;
}
