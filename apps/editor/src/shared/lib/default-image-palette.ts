import { ImagePixelData } from './pixel-render';

export const TRANSPARENT_PALETTE_TOKEN = 'ff';

/** EGA-style 16-color palette plus transparent (fallback when no sibling palette exists). */
export const DEFAULT_IMAGE_PALETTE: ImagePixelData['palette'] = {
  [TRANSPARENT_PALETTE_TOKEN]: [0, 0, 0, 0],
  '00': [0, 0, 0, 255],
  '01': [0, 0, 170, 255],
  '02': [0, 170, 0, 255],
  '03': [0, 170, 170, 255],
  '04': [170, 0, 0, 255],
  '05': [170, 0, 170, 255],
  '06': [170, 85, 0, 255],
  '07': [170, 170, 170, 255],
  '08': [85, 85, 85, 255],
  '09': [85, 85, 255, 255],
  '0a': [85, 255, 85, 255],
  '0b': [85, 255, 255, 255],
  '0c': [255, 85, 85, 255],
  '0d': [255, 85, 255, 255],
  '0e': [255, 255, 85, 255],
  '0f': [255, 255, 255, 255],
};
