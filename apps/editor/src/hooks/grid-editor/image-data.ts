import { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { Point2d, Size2d } from '@sharedTypes/engine';
import { ImageData } from '@sharedTypes/resource/image';
import { RGBA } from '@sharedTypes/util/color';
import { rgbaToCss } from '@editor/lib/color';

type UseImageDataProps = {
  defaultValue: ImageData;
  onCommit: (resource: ImageData) => void;
};

export function resizeGrid<T>(grid: T[][], size: Size2d, fillValue: T): T[][] {
  return [
    ...grid
      .slice(0, size.height)
      .map((row) => [...row.slice(0, size.width), ...new Array(Math.max(0, size.width - row.length)).fill(fillValue)]),
    ...new Array(Math.max(0, size.height - grid.length)).fill(null).map(() => new Array(size.width).fill(fillValue)),
  ];
}

const toMatrix = (strArray: string[]) => strArray.map((rowStr) => rowStr.split(' '));

export function useImageData({ defaultValue, onCommit }: UseImageDataProps) {
  const [palette, setPalette] = useState<Record<string, number[]>>(defaultValue.palette ?? { ff: [0, 0, 0, 0] });
  const [pixels, setPixels] = useState<string[][]>(toMatrix(defaultValue.pixels));
  const [size, setSize] = useState<Size2d>(defaultValue.size);

  const load = useCallback((resource: ImageData) => {
    setPalette(resource.palette);
    setPixels(
      Array.from({ length: resource.size.height }, (_, y) =>
        resource.pixels.slice(y * resource.size.width, (y + 1) * resource.size.width)
      )
    );
    setSize(resource.size);
  }, []);

  const commit = useCallback(() => {
    onCommit({
      size,
      palette,
      pixels: pixels.map((row) => row.join(' ')),
    });
  }, [size, palette, pixels, onCommit]);

  useLayoutEffect(() => {
    setPixels((prev) => resizeGrid(prev, size, 'ff'));
  }, [size]);

  const gridBounds = useMemo(() => ({ minX: 0, minY: 0, maxX: size.width - 1, maxY: size.height - 1 }), [size]);

  const checkInRange = useCallback(
    ({ x, y }: Point2d) => x >= gridBounds.minX && y >= gridBounds.minY && x <= gridBounds.maxX && y <= gridBounds.maxY,
    [gridBounds]
  );
  const getPixel = useCallback(({ x, y }: Point2d) => pixels[y][x], [pixels]);

  const paletteCss = useMemo(
    () => Object.fromEntries(Object.entries(palette).map(([key, rgba]) => [key, rgbaToCss(rgba as RGBA)])),
    [palette]
  );

  const getColorStyle = useCallback(
    (gridPos: Point2d) => {
      const key = getPixel(gridPos);
      if (!key) return;

      return paletteCss[key];
    },
    [getPixel, paletteCss]
  );

  const setPixel = useCallback(
    ({ x, y }: Point2d, paletteKey: string) => {
      if (!checkInRange({ x, y })) return false;
      if (getPixel({ x, y }) === paletteKey) return false;

      setPixels((pixels) => [
        ...pixels.slice(0, y),
        [...pixels[y].slice(0, x), paletteKey, ...pixels[y].slice(x + 1)],
        ...pixels.slice(y + 1),
      ]);
      return true;
    },
    [checkInRange, getPixel]
  );

  return {
    load,
    commit,
    pixels,
    getPixel,
    getColorStyle,
    setPixel,
    setPixels,
    gridBounds,
    size,
    palette,
    setSize,
    setPalette,
  };
}
