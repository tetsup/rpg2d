import { DEFAULT_IMAGE_PALETTE } from './default-image-palette';
import type { ImagePixelData } from './pixel-render';

/**
 * Palette priority for new images (spec order 2 → 1 → 3):
 * 1. Same skin (other direction textures)
 * 2. Same texture (sibling frames)
 * 3. Default palette
 */
export function resolvePaletteForNewImage(candidates: {
  sameSkinPalettes?: ImagePixelData['palette'][];
  sameTexturePalettes?: ImagePixelData['palette'][];
}): ImagePixelData['palette'] {
  const fromSkin = candidates.sameSkinPalettes?.find((palette) => Object.keys(palette).length > 0);
  if (fromSkin) return { ...fromSkin };

  const fromTexture = candidates.sameTexturePalettes?.find((palette) => Object.keys(palette).length > 0);
  if (fromTexture) return { ...fromTexture };

  return { ...DEFAULT_IMAGE_PALETTE };
}
