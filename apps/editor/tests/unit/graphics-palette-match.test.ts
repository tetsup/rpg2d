import { describe, expect, it } from 'vitest';
import { resolvePaletteForNewImage } from '@editor/lib/graphics-palette-match';
import { DEFAULT_IMAGE_PALETTE } from '@editor/lib/default-image-palette';

describe('resolvePaletteForNewImage', () => {
  it('prefers same-skin palettes over same-texture palettes', () => {
    const palette = resolvePaletteForNewImage({
      sameSkinPalettes: [{ aa: [1, 2, 3, 4] }],
      sameTexturePalettes: [{ bb: [5, 6, 7, 8] }],
    });

    expect(palette).toEqual({ aa: [1, 2, 3, 4] });
  });

  it('falls back to same-texture palettes before default', () => {
    const palette = resolvePaletteForNewImage({
      sameTexturePalettes: [{ cc: [9, 9, 9, 9] }],
    });

    expect(palette).toEqual({ cc: [9, 9, 9, 9] });
  });

  it('uses the default palette when no candidates exist', () => {
    expect(resolvePaletteForNewImage({})).toEqual(DEFAULT_IMAGE_PALETTE);
  });
});
