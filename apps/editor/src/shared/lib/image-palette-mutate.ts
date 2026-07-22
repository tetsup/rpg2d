import type { ImagePixelData } from './pixel-render';

const TOKEN_CHARS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

const DEFAULT_NEW_COLOR: [number, number, number, number] = [128, 128, 128, 255];

export function allocatePaletteToken(existing: ReadonlySet<string>): string | null {
  for (const first of TOKEN_CHARS) {
    for (const second of TOKEN_CHARS) {
      const token = `${first}${second}`;
      if (!existing.has(token)) return token;
    }
  }
  return null;
}

export function addPaletteColor(
  data: ImagePixelData,
  rgba: [number, number, number, number] = DEFAULT_NEW_COLOR
): { data: ImagePixelData; token: string } | null {
  const token = allocatePaletteToken(new Set(Object.keys(data.palette)));
  if (token == null) return null;

  return {
    token,
    data: {
      ...data,
      palette: { ...data.palette, [token]: rgba },
    },
  };
}

export function removePaletteColor(data: ImagePixelData, token: string): ImagePixelData | null {
  const keys = Object.keys(data.palette);
  if (keys.length <= 1 || !(token in data.palette)) return null;

  const fallback = keys.find((key) => key !== token) ?? keys[0];
  const palette = { ...data.palette };
  delete palette[token];

  const pixels = data.pixels.map((row) =>
    row
      .split(/\s+/)
      .map((pixelToken) => (pixelToken === token ? fallback : pixelToken))
      .join(' ')
  );

  return { ...data, palette, pixels };
}
