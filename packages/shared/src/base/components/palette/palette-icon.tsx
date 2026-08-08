import type { RGBA } from '@sharedTypes/util/color';
import { rgbaToCss } from '@base/lib/color';
import { ColorSwatch } from './color-swatch';

export function PaletteIcon({ color }: { color?: number[] }) {
  const cssColor = rgbaToCss((color ?? [0, 0, 0, 0]) as RGBA);
  return <ColorSwatch color={cssColor} className="size-6 rounded-xs" />;
}
