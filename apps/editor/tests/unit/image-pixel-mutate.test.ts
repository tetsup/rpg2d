import { describe, expect, it } from 'vitest';
import { getDefaultPaletteToken, setImagePixel } from '@editor/lib/image-pixel-mutate';

const sample = {
  size: { width: 2, height: 2 },
  palette: { aa: [0, 0, 0, 255], bb: [255, 0, 0, 255] },
  pixels: ['aa bb', 'bb aa'],
};

describe('setImagePixel', () => {
  it('updates a pixel token in place', () => {
    const next = setImagePixel(sample, 0, 0, 'bb');

    expect(next.pixels[0]).toBe('bb bb');
    expect(next.pixels[1]).toBe('bb aa');
    expect(next).not.toBe(sample);
  });

  it('ignores out-of-bounds coordinates', () => {
    expect(setImagePixel(sample, -1, 0, 'bb')).toBe(sample);
    expect(setImagePixel(sample, 2, 0, 'bb')).toBe(sample);
  });
});

describe('getDefaultPaletteToken', () => {
  it('returns the first opaque palette key', () => {
    expect(getDefaultPaletteToken(sample.palette)).toBe('aa');
  });

  it('skips transparent ff when choosing a paint color', () => {
    expect(getDefaultPaletteToken({ ff: [0, 0, 0, 0], aa: [0, 0, 0, 255] })).toBe('aa');
  });
});
