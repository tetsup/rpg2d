import type { ImagePixelData } from './pixel-render';

export function setImagePixel(data: ImagePixelData, x: number, y: number, token: string): ImagePixelData {
  const { width, height } = data.size;
  if (x < 0 || y < 0 || x >= width || y >= height) return data;

  const tokens = data.pixels[y]?.split(/\s+/) ?? [];
  if (tokens.length !== width) return data;

  tokens[x] = token;
  const pixels = [...data.pixels];
  pixels[y] = tokens.join(' ');
  return { ...data, pixels };
}

export function getDefaultPaletteToken(palette: ImagePixelData['palette']): string {
  const opaque = Object.keys(palette).find((key) => key !== 'ff');
  return opaque ?? 'ff';
}
