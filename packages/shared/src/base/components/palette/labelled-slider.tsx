import { Slider } from '@base/components/ui/slider';

type LabelledSliderProps = {
  value: number;
  onValueChange: (value: number | readonly number[]) => void;
  label: string;
  min: number;
  max: number;
  step: number;
};

export function LabelledSlider({ value, onValueChange, label, min, max, step }: LabelledSliderProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-4 text-xs font-medium">{label}</span>
      <Slider value={value} min={min} max={max} step={step} onValueChange={onValueChange} />
      <span className="w-8 text-right font-mono text-xs">{value}</span>
    </div>
  );
}
