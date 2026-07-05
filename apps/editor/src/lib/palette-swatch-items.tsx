import type { ImagePixelData } from '@editor/lib/pixel-render';

export function buildPaletteSwatchItems(
  palette: ImagePixelData['palette'] | undefined,
  selectedToken?: string
) {
  if (palette == null) return [];
  return Object.entries(palette).map(([token, rgba]) => ({
    key: token,
    label: token,
    swatch: (
      <span className="block size-full" style={{ backgroundColor: `rgba(${rgba.join(',')})` }} />
    ),
    isDirty: token === selectedToken,
  }));
}
