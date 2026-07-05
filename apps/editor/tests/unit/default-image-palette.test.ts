import { describe, expect, it } from 'vitest';
import { createEmptyImageData } from '@editor/lib/empty-image-data';
import { DEFAULT_IMAGE_PALETTE, TRANSPARENT_PALETTE_TOKEN } from '@editor/lib/default-image-palette';
import { getDefaultPaletteToken } from '@editor/lib/image-pixel-mutate';

describe('DEFAULT_IMAGE_PALETTE', () => {
  it('includes transparent plus 16 colors', () => {
    expect(Object.keys(DEFAULT_IMAGE_PALETTE)).toHaveLength(17);
    expect(DEFAULT_IMAGE_PALETTE[TRANSPARENT_PALETTE_TOKEN]).toEqual([0, 0, 0, 0]);
  });
});

describe('createEmptyImageData', () => {
  it('initializes pixels as transparent with the default palette', () => {
    const image = createEmptyImageData(2, 2);

    expect(image.palette).toEqual(DEFAULT_IMAGE_PALETTE);
    expect(image.pixels).toEqual(['ff ff', 'ff ff']);
    expect(getDefaultPaletteToken(image.palette)).toBe('00');
  });
});
