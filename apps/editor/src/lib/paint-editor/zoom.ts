export const ZOOM_MIN = 0.5;
export const ZOOM_MAX = 64;
export const ZOOM_STEP = 0.25;

/** Relative zoom where 1 means the viewport-fit cell size (displayed as 100%). */
export function clampZoom(value: number): number {
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, value));
}

export function zoomIn(value: number): number {
  return clampZoom(value + ZOOM_STEP);
}

export function zoomOut(value: number): number {
  return clampZoom(value - ZOOM_STEP);
}

export function formatZoomLabel(relativeZoom: number): string {
  return `${Math.round(relativeZoom * 100)}%`;
}

/** CSS px per logical px that fits the canvas inside the container (unclamped). */
export function computeFitCellSize(
  canvasWidth: number,
  canvasHeight: number,
  containerWidth: number,
  containerHeight: number
): number {
  if (canvasWidth <= 0 || canvasHeight <= 0 || containerWidth <= 0 || containerHeight <= 0) {
    return 1;
  }
  return Math.min(containerWidth / canvasWidth, containerHeight / canvasHeight);
}

export function toCellSize(fitCellSize: number, relativeZoom: number): number {
  if (fitCellSize <= 0 || relativeZoom <= 0) return 1;
  return fitCellSize * relativeZoom;
}
