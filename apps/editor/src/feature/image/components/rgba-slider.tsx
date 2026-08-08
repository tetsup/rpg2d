import { RGBA } from '@sharedTypes/util/color';
import { LabelledSlider } from '@base/components/palette/labelled-slider';
import { VerticalStacker } from '@base/components/layout/vertical-stacker';

type RgbaSliderProps = {
  color: RGBA;
  setColor: (color: RGBA) => void;
};

export function RgbaSlider({ color, setColor }: RgbaSliderProps) {
  const updateChannel = (ch: 'R' | 'G' | 'B' | 'A', v: number) => {
    if (ch === 'R') setColor([v, color[1], color[2], color[3]]);
    else if (ch === 'G') setColor([color[0], v, color[2], color[3]]);
    else if (ch === 'B') setColor([color[0], color[1], v, color[3]]);
    else if (ch === 'A') setColor([color[0], color[1], color[2], v]);
  };

  return (
    <VerticalStacker size="xs">
      <LabelledSlider
        value={color[0]}
        onValueChange={(v) => {
          updateChannel('R', v as number);
        }}
        label="R"
        min={0}
        max={255}
        step={1}
      />
      <LabelledSlider
        value={color[1]}
        onValueChange={(next) => {
          updateChannel('G', next as number);
        }}
        label="G"
        min={0}
        max={255}
        step={1}
      />
      <LabelledSlider
        value={color[2]}
        onValueChange={(next) => {
          updateChannel('B', next as number);
        }}
        label="B"
        min={0}
        max={255}
        step={1}
      />
      <LabelledSlider
        value={color[3]}
        onValueChange={(next) => {
          updateChannel('A', next as number);
        }}
        label="A"
        min={0}
        max={255}
        step={1}
      />
    </VerticalStacker>
  );
}
