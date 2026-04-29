import { dt3ToRgba } from './dt3';
import { rgbaToPng } from './png';
import { yamlToRgba } from './yaml';

export async function yamlToPng(yamlText: string): Promise<ArrayBuffer> {
  const { size, rgba } = yamlToRgba(yamlText);
  return rgbaToPng(size, rgba);
}

export async function dt3ToPng(dt3Text: string): Promise<ArrayBuffer> {
  const { size, rgba } = dt3ToRgba(dt3Text);
  return rgbaToPng(size, rgba);
}
