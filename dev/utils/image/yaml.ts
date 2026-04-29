import { parse } from 'yaml';
import type { Size2d } from '@/types/engine';
import { rgbaArrayToUint8 } from './rgba';

export function yamlToRgba(yamlText: string): {
  size: Size2d;
  rgba: Uint8Array;
} {
  const { size, palette, pixels } = parse(yamlText);

  const tokens = pixels.match(/[0-9a-zA-Z]{2}/g);
  if (!tokens) throw new Error('invalid pixels');

  const colorArray = tokens.map((token: string) => palette[token]);

  return {
    size,
    rgba: rgbaArrayToUint8(colorArray),
  };
}
