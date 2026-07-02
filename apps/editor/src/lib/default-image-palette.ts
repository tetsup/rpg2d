import type { ImagePixelData } from '@editor/lib/pixel-render';

/** Fallback palette when no sibling image palette is available (priority 3). */
export const DEFAULT_IMAGE_PALETTE: ImagePixelData['palette'] = {
  ff: [0, 0, 0, 0],
  '00': [0, 0, 0, 255],
  '01': [255, 255, 255, 255],
};
