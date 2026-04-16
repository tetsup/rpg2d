import { PNG } from 'pngjs';
import { yamlToPng, dt3ToPng } from '@dev/utils/image-converter';

function decodePng(buffer: ArrayBuffer | SharedArrayBuffer) {
  const png = PNG.sync.read(Buffer.from(buffer));
  return {
    width: png.width,
    height: png.height,
    data: png.data,
  };
}

describe('yamlToPng', () => {
  it('paletteとpixelsから正しくPNGが生成される', () => {
    const yamlText = `
size:
  width: 2
  height: 1
palette:
  aa: [255, 0, 0, 255]
  bb: [0, 255, 0, 255]
pixels: "aa bb"
`;

    const buffer = yamlToPng(yamlText);
    const png = decodePng(buffer);

    expect(png.width).toBe(2);
    expect(png.height).toBe(1);

    expect(Array.from(png.data)).toEqual([255, 0, 0, 255, 0, 255, 0, 255]);
  });

  it('invalid pixelsでエラーになる', () => {
    const yamlText = `
size: { width: 1, height: 1 }
palette: { aa: [0, 0, 0, 255] }
pixels: ""
`;

    expect(() => yamlToPng(yamlText)).toThrow('invalid pixels');
  });
});

describe('dt3ToPng', () => {
  it('DT3フォーマットを正しくPNGに変換できる', () => {
    const dt3 = `1,2:0,1:${0xff0000},${0x00ff00}:999`;
    const buffer = dt3ToPng(dt3);
    const png = decodePng(buffer);

    expect(png.width).toBe(2);
    expect(png.height).toBe(1);
    expect(Array.from(png.data)).toEqual([255, 0, 0, 255, 0, 255, 0, 255]);
  });

  it('transparent指定がalphaに反映される', () => {
    const dt3 = `1,2:0,1:${0xff0000},${0x00ff00}:1`;
    const buffer = dt3ToPng(dt3);
    const png = decodePng(buffer);

    expect(Array.from(png.data)).toEqual([255, 0, 0, 255, 0, 255, 0, 0]);
  });
});
