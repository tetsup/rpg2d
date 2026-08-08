import type { RGBA } from '@sharedTypes/util/color';
import { rgbaToCss } from '@base/lib/color';
import { ColorSwatch } from './color-swatch';

type ColorDisplayProps = {
  color: RGBA;
};

export function ColorDisplay({ color }: ColorDisplayProps) {
  return (
    <div className="flex items-center gap-2">
      <ColorSwatch color={rgbaToCss(color)} className="size-8 rounded border" />
      <span className="font-mono text-xs">
        #{color[0].toString(16).padStart(2, '0')}
        {color[1].toString(16).padStart(2, '0')}
        {color[2].toString(16).padStart(2, '0')}
        {color[3].toString(16).padStart(2, '0')}
      </span>
    </div>
  );
}
