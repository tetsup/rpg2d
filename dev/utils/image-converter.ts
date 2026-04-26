import yaml from 'yaml';
import { Size2d } from '@/types/engine';

async function colorArrayToPng(size: Size2d, colorArray: number[][]) {
  const canvas = new OffscreenCanvas(size.width, size.height);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context not available');

  const imageData = ctx.createImageData(size.width, size.height);
  colorArray.forEach((color: number[], i: number) => {
    const [r, g, b, a] = color;
    const idx = i * 4;

    imageData.data[idx] = r;
    imageData.data[idx + 1] = g;
    imageData.data[idx + 2] = b;
    imageData.data[idx + 3] = a;
  });

  ctx.putImageData(imageData, 0, 0);
  return await (await canvas.convertToBlob({ type: 'image/png' })).arrayBuffer();
}

export async function yamlToPng(yamlText: string) {
  const { size, palette, pixels } = yaml.parse(yamlText);

  const tokens = pixels.match(/[0-9a-zA-Z]{2}/g);
  if (!tokens) throw new Error('invalid pixels');

  const colorArray = tokens.map((token: string) => palette[token]);
  return await colorArrayToPng(size, colorArray);
}

export async function dt3ToPng(dt3Text: string) {
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
  return await colorArrayToPng({ height, width }, colorArray);
}
