import { describe, it, expect } from 'vitest';
import { yamlToRgba } from '@dev/utils/image/yaml';

describe('yamlToRgba', () => {
  it('paletteとpixelsからRGBAを生成できる', () => {
    const yamlText = `
size:
  width: 2
  height: 1
palette:
  aa: [255, 0, 0, 255]
  bb: [0, 255, 0, 255]
pixels:
  - "aa bb"
`;

    const { size, rgba } = yamlToRgba(yamlText);

    expect(size).toEqual({ width: 2, height: 1 });
    expect(Array.from(rgba)).toEqual([255, 0, 0, 255, 0, 255, 0, 255]);
  });

  it('invalid pixelsでエラーになる', () => {
    const yamlText = `
size: { width: 1, height: 1 }
palette: { aa: [0, 0, 0, 255] }
pixels: 
  - ""
`;

    expect(() => yamlToRgba(yamlText)).toThrow('invalid_format');
  });
});
