import { useCallback, useMemo } from 'react';
import type { useScreen } from './use-screen';

type UseZoomToolProps = {
  screen: ReturnType<typeof useScreen>;
};

export const useZoomTool = ({ screen }: UseZoomToolProps) => {
  const zoom = useMemo(() => screen.zoom, [screen.zoom]);
  const zoomIn = useCallback(() => {
    screen.zoomBy(1.5);
  }, [screen.zoomBy]);
  const zoomOut = useCallback(() => {
    screen.zoomBy(1 / 1.5);
  }, [screen.zoomBy]);

  const zoomToFit = useCallback(() => screen.zoomToFit(), [screen.zoomToFit]);

  const canZoomUp = useCallback(() => zoom >= screen.calcMinZoom(), [screen.calcMinZoom, zoom]);

  return { zoom, zoomToFit, zoomIn, zoomOut, canZoomUp };
};
