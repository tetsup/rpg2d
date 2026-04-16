import yaml from 'yaml';
import { PNG } from 'pngjs';
import { Size2d } from '@/types/engine';

function colorArrayToPng(size: Size2d, colorArray: number[][]) {
  const png = new PNG(size);
  colorArray.forEach((color: number[], i: number) => {
    const [r, g, b, a] = color;
    const idx = i * 4;

    png.data[idx] = r;
    png.data[idx + 1] = g;
    png.data[idx + 2] = b;
    png.data[idx + 3] = a;
  });

  const buffer = PNG.sync.write(png);

  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
}

export function yamlToPng(yamlText: string): ArrayBuffer | SharedArrayBuffer {
  const { size, palette, pixels } = yaml.parse(yamlText);

  const tokens = pixels.match(/[0-9a-zA-Z]{2}/g);
  if (!tokens) throw new Error('invalid pixels');

  const colorArray = tokens.map((token: string) => palette[token]);
  return colorArrayToPng(size, colorArray);
}

export function dt3ToPng(dt3Text: string): ArrayBuffer | SharedArrayBuffer {
  const [sizeText, pixelsText, paletteText, transparentText] = dt3Text.split(':');

  const [height, width] = sizeText.split(',').map(Number);
  const transparent = Number(transparentText);

  const pixels = pixelsText.split(',').map(Number);
  const palette = paletteText
    .split(',')
    .map(Number)
    .map((colorInt, i) => [
      Math.floor(colorInt / 0x10000),
      Math.floor((colorInt % 0x10000) / 0x100),
      Math.floor(colorInt % 0x100),
      i === transparent ? 0 : 255,
    ]);

  const colorArray = pixels.map((pixel) => palette[pixel]);
  return colorArrayToPng({ height, width }, colorArray);
}
