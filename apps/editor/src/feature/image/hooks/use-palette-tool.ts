import { useCallback, useMemo, useState } from 'react';
import type { ImageData } from '@sharedTypes/resource/image';
import type { RGBA } from '@sharedTypes/util/color';
import { useImageData } from './use-image-data';

type UsePaletteToolProps = {
  image: ReturnType<typeof useImageData>;
};

const ensureDefaultPalette = (palette: ImageData['palette']) => {
  if ('ff' in palette) return palette;
  return {
    ...palette,
    ff: [0, 0, 0, 0],
  };
};

const normalizePixels = (pixels: string[][], palette: ImageData['palette']) => {
  return pixels.map((row) => row.map((cell) => (cell in palette ? cell : 'ff')));
};

const searchNextIndex = (palette: ImageData['palette']) => {
  for (let i = 0; i < 255; i++) {
    const hex = i.toString(16).padStart(2, '0');
    if (!(hex in palette)) return hex;
  }
  return null;
};

export const usePaletteTool = ({ image }: UsePaletteToolProps) => {
  const [current, setCurrent] = useState('ff');

  const currentColor = useMemo(() => image.palette[current], [image.palette, current]);

  const applyPalette = useCallback(
    (palette: ImageData['palette']) => {
      const nextPalette = ensureDefaultPalette(palette);

      image.setPalette(nextPalette);
      image.setPixels((prev) => normalizePixels(prev, nextPalette));
    },
    [image]
  );

  const items = useMemo(
    () => Object.entries(image.palette).map(([key, color]) => ({ key, label: key, color: color as RGBA })),
    [image.palette]
  );

  const load = useCallback(
    (palette: ImageData['palette']) => {
      applyPalette(palette);
    },
    [applyPalette]
  );

  const change = useCallback(
    (index: string, color: number[]) => {
      applyPalette({
        ...image.palette,
        [index]: color,
      });
    },
    [applyPalette, image.palette]
  );

  const create = useCallback(
    (color: number[]) => {
      const index = searchNextIndex(image.palette);
      if (!index) return;

      applyPalette({
        ...image.palette,
        [index]: color,
      });
    },
    [applyPalette, image.palette]
  );

  const remove = useCallback(
    (index: string) => {
      const nextPalette = Object.fromEntries(Object.entries(image.palette).filter(([k]) => k !== index));

      applyPalette(nextPalette);
    },
    [applyPalette, image.palette]
  );

  return {
    load,
    items,
    create,
    change,
    remove,
    current,
    setCurrent,
    currentColor,
  };
};
