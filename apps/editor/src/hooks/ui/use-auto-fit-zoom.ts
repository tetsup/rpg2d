import { useEffect } from 'react';
import type { RefObject } from 'react';
import { autoFitZoom } from '@editor/lib/paint-editor/zoom';

type UseAutoFitZoomParams = {
  containerRef: RefObject<HTMLElement | null>;
  canvasWidth: number;
  canvasHeight: number;
  imageKey: string | null;
  setZoom: (zoom: number) => void;
};

export function useAutoFitZoom({
  containerRef,
  canvasWidth,
  canvasHeight,
  imageKey,
  setZoom,
}: UseAutoFitZoomParams) {
  useEffect(() => {
    const container = containerRef.current;
    if (container == null || imageKey == null || canvasWidth <= 0 || canvasHeight <= 0) {
      return;
    }

    let applied = false;

    const applyFit = () => {
      if (applied) return;

      const { clientWidth, clientHeight } = container;
      if (clientWidth <= 0 || clientHeight <= 0) return;

      const fit = autoFitZoom(canvasWidth, canvasHeight, clientWidth, clientHeight);
      if (fit != null) {
        setZoom(fit);
      }
      applied = true;
    };

    applyFit();
    if (applied) return;

    if (typeof ResizeObserver === 'undefined') {
      return;
    }

    const observer = new ResizeObserver(() => {
      applyFit();
      if (applied) {
        observer.disconnect();
      }
    });
    observer.observe(container);

    return () => observer.disconnect();
  }, [canvasHeight, canvasWidth, containerRef, imageKey, setZoom]);
}
