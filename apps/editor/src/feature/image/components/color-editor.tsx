import type { RGBA } from '@sharedTypes/util/color';
import { ColorDisplay } from '@base/components/palette/color-display';
import { Box } from '@base/components/layout/box';
import { VerticalStacker } from '@base/components/layout/vertical-stacker';
import { RgbaSlider } from './rgba-slider';

type ColorEditorProps = {
  value: RGBA;
  setValue: (value: RGBA) => void;
};

export function ColorEditor({ value, setValue }: ColorEditorProps) {
  return (
    <Box size="xs" variant="outlined">
      <VerticalStacker size="xs">
        <ColorDisplay color={value} />
        <RgbaSlider color={value} setColor={setValue} />
      </VerticalStacker>
    </Box>
  );
}
