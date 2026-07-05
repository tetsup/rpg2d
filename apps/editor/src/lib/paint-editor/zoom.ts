export const ZOOM_MIN = 0.5;
export const ZOOM_MAX = 8;
export const ZOOM_STEP = 0.25;

export function clampZoom(value: number): number {
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, value));
}

export function zoomIn(value: number): number {
  return clampZoom(value + ZOOM_STEP);
}

export function zoomOut(value: number): number {
  return clampZoom(value - ZOOM_STEP);
}

export function fitZoom(
  canvasWidth: number,
  canvasHeight: number,
  containerWidth: number,
  containerHeight: number
): number {
  if (canvasWidth <= 0 || canvasHeight <= 0 || containerWidth <= 0 || containerHeight <= 0) {
    return 1;
  }
  return clampZoom(Math.min(containerWidth / canvasWidth, containerHeight / canvasHeight));
}
