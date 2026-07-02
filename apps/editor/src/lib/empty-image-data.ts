import type { ImagePixelData } from '@editor/lib/pixel-render';

const TRANSPARENT_TOKEN = 'ff';

export function createEmptyImageData(width: number, height: number): ImagePixelData {
  const row = Array(width).fill(TRANSPARENT_TOKEN).join(' ');
  return {
    size: { width, height },
    palette: { [TRANSPARENT_TOKEN]: [0, 0, 0, 0] },
    pixels: Array(height).fill(row),
  };
}
