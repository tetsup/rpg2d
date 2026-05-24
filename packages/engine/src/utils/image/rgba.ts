import type { Size2d } from '@sharedTypes/engine';
import type { ImageData } from '@sharedTypes/resource/image';

export function objToRgba(data: ImageData): { size: Size2d; rgba: Uint8Array } {
  return {
    size: data.size,
    rgba: rgbaArrayToUint8(data.pixels.flatMap((row) => row.split(' ').map((pixel) => data.palette[pixel]))),
  };
}

export function rgbaArrayToUint8(data: number[][]): Uint8Array {
  const out = new Uint8Array(data.length * 4);
  let i = 0;
  for (const [r, g, b, a] of data) {
    out[i++] = r;
    out[i++] = g;
    out[i++] = b;
    out[i++] = a;
  }
  return out;
}
