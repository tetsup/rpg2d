import { DEFAULT_IMAGE_PALETTE, TRANSPARENT_PALETTE_TOKEN } from './default-image-palette';
import type { ImagePixelData } from './pixel-render';

export function createEmptyImageData(width: number, height: number): ImagePixelData {
  const row = Array(width).fill(TRANSPARENT_PALETTE_TOKEN).join(' ');
  return {
    size: { width, height },
    palette: { ...DEFAULT_IMAGE_PALETTE },
    pixels: Array(height).fill(row),
  };
}
