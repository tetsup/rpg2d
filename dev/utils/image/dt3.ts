import type { Size2d } from '@/types/engine';
import { rgbaArrayToUint8 } from './rgba';

export function dt3ToRgba(dt3Text: string): {
  size: Size2d;
  rgba: Uint8Array;
} {
  const [sizeText, pixelsText, paletteText, transparentText] = dt3Text.split(':');

  const [height, width] = sizeText.split(',').map(Number);
  const transparent = Number(transparentText);

  const pixels = pixelsText.split(',').map(Number);

  const palette = paletteText
    .split(',')
    .map(Number)
    .map((colorInt, i) => [
      (colorInt >> 16) & 0xff,
      (colorInt >> 8) & 0xff,
      colorInt & 0xff,
      i === transparent ? 0 : 255,
    ]);

  const colorArray = pixels.map((p) => palette[p]);

  return {
    size: { width, height },
    rgba: rgbaArrayToUint8(colorArray),
  };
}
