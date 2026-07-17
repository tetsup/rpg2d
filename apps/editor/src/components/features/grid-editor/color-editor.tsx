import type { RGBA } from '@sharedTypes/util/color';
import { Slider } from '@editor/components/ui/slider';
import { cn } from '@editor/lib/utils';
import { rgbaToCss } from '@editor/lib/color';
import { ColorSwatch } from './color-swatch';

type ColorSliderProps = {
  value: number;
  onValueChange: (value: number | readonly number[]) => void;
  label: string;
};

type ColorEditorProps = {
  value: RGBA;
  setValue: (value: RGBA) => void;
  className?: string;
};

export function ColorSlider({ value, onValueChange, label }: ColorSliderProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-4 text-xs font-medium">{label}</span>
      <Slider value={value} min={0} max={255} step={1} onValueChange={onValueChange} />
      <span className="w-8 text-right font-mono text-xs">{value}</span>
    </div>
  );
}

export function ColorEditor({ value, setValue, className }: ColorEditorProps) {
  const updateChannel = (index: number, next: number) => {
    setValue([...value.slice(0, index), next, ...value.slice(index + 1)] as RGBA);
  };

  return (
    <div className={cn('space-y-2 rounded border p-2', className)}>
      <div className="flex items-center gap-2">
        <ColorSwatch color={rgbaToCss(value)} className="size-8 rounded border" />
        <span className="font-mono text-xs">
          #{value[0].toString(16).padStart(2, '0')}
          {value[1].toString(16).padStart(2, '0')}
          {value[2].toString(16).padStart(2, '0')}
          {value[3].toString(16).padStart(2, '0')}
        </span>
      </div>

      <div className="space-y-1 gap-2">
        <ColorSlider
          value={value[0]}
          onValueChange={(next) => {
            updateChannel(0, next as number);
          }}
          label="R"
        />
        <ColorSlider
          value={value[1]}
          onValueChange={(next) => {
            updateChannel(1, next as number);
          }}
          label="G"
        />
        <ColorSlider
          value={value[2]}
          onValueChange={(next) => {
            updateChannel(2, next as number);
          }}
          label="B"
        />
        <ColorSlider
          value={value[3]}
          onValueChange={(next) => {
            updateChannel(3, next as number);
          }}
          label="A"
        />
      </div>
    </div>
  );
}
