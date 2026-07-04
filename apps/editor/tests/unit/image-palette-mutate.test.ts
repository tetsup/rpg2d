import { describe, expect, it } from 'vitest';
import {
  addPaletteColor,
  allocatePaletteToken,
  removePaletteColor,
} from '@editor/lib/image-palette-mutate';

const sample = {
  size: { width: 2, height: 2 },
  palette: {
    aa: [0, 0, 0, 255],
    bb: [255, 0, 0, 255],
  },
  pixels: ['aa bb', 'bb aa'],
};

describe('allocatePaletteToken', () => {
  it('returns the first unused 2-character token', () => {
    expect(allocatePaletteToken(new Set(['aa', 'bb']))).toBe('00');
  });
});

describe('addPaletteColor', () => {
  it('appends a new palette entry', () => {
    const result = addPaletteColor(sample, [0, 255, 0, 255]);

    expect(result?.token).toBe('00');
    expect(result?.data.palette).toMatchObject({
      aa: [0, 0, 0, 255],
      bb: [255, 0, 0, 255],
      '00': [0, 255, 0, 255],
    });
  });
});

describe('removePaletteColor', () => {
  it('removes a token and remaps pixels to a fallback', () => {
    const next = removePaletteColor(sample, 'aa');

    expect(next?.palette).toEqual({ bb: [255, 0, 0, 255] });
    expect(next?.pixels).toEqual(['bb bb', 'bb bb']);
  });

  it('refuses to remove the last palette entry', () => {
    const single = {
      ...sample,
      palette: { aa: [0, 0, 0, 255] },
      pixels: ['aa aa', 'aa aa'],
    };

    expect(removePaletteColor(single, 'aa')).toBeNull();
  });
});
