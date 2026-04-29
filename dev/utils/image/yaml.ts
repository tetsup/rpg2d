import { parse } from 'yaml';
import type { Size2d } from '@/types/engine';
import { yamlImageSchema } from '@dev/schemas/image';

export function yamlToRgba(yamlText: string): {
  size: Size2d;
  rgba: Uint8Array;
} {
  const obj = parse(yamlText);
  return yamlImageSchema.parse(obj);
}
