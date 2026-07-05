import { useEffect } from 'react';

export function useResetZoomOnImageChange(imageKey: string | null, setZoom: (zoom: number) => void) {
  useEffect(() => {
    if (imageKey == null) return;
    setZoom(1);
  }, [imageKey, setZoom]);
}
