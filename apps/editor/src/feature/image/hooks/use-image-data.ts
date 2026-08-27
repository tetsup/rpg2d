import { useCallback, useMemo } from 'react';
import type { Point2d, Size2d } from '@sharedTypes/engine';
import type { ImageData } from '@sharedTypes/resource/image';
import type { RGBA } from '@sharedTypes/util/color';
import { rgbaToCss } from '@base/lib/color';

type UseImageDataProps = {
  data: ImageData;
  setData: (prev: ImageData) => void;
};

export function resizeGrid<T>(flatGrid: T[], prevSize: Size2d, newSize: Size2d, fillValue: T): T[] {
  const grid = toGrid(flatGrid, prevSize);
  return [
    ...grid
      .slice(0, prevSize.height)
      .map((row) => [
        ...row.slice(0, prevSize.width),
        ...new Array(Math.max(0, newSize.width - row.length)).fill(fillValue),
      ]),
    ...new Array(Math.max(0, newSize.height - grid.length))
      .fill(null)
      .map(() => new Array(newSize.width).fill(fillValue)),
  ].flat();
}

function toGrid<T>(flatArray: T[], size: Size2d) {
  return Array(size.height).map((_, rowIndex) => flatArray.slice(rowIndex * size.width, (rowIndex + 1) * size.width));
}

export function useImageData({ data, setData }: UseImageDataProps) {
  const setPalette = (newPalette: Record<string, number[]>, newPixels?: string[]) => {
    setData({ ...data, palette: newPalette, pixels: newPixels ?? data.pixels });
  };

  const setPixels = (newPixels: string[]) => {
    setData({
      ...data,
      pixels: newPixels,
    });
  };

  const setSize = (newSize: Size2d) => {
    setData({ ...data, size: newSize, pixels: resizeGrid(data.pixels, data.size, newSize, 'ff').flat() });
  };

  const gridBounds = useMemo(
    () => ({ minX: 0, minY: 0, maxX: data.size.width - 1, maxY: data.size.height - 1 }),
    [data.size]
  );

  const checkInRange = useCallback(
    ({ x, y }: Point2d) => x >= gridBounds.minX && y >= gridBounds.minY && x <= gridBounds.maxX && y <= gridBounds.maxY,
    [gridBounds]
  );

  const getPixel = useCallback(({ x, y }: Point2d) => data.pixels[y].split(' ')[x], [data.pixels, data.size]);

  const paletteCss = useMemo(
    () => Object.fromEntries(Object.entries(data.palette).map(([key, rgba]) => [key, rgbaToCss(rgba as RGBA)])),
    [data.palette]
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

      setPixels([
        ...data.pixels.slice(0, y),
        data.pixels[y]
          .split(' ')
          .map((cell, _x) => (x === _x ? paletteKey : cell))
          .join(' '),
        ...data.pixels.slice(y + 1),
      ]);
      return true;
    },
    [checkInRange, getPixel, setPixels, data]
  );

  return {
    data,
    getPixel,
    getColorStyle,
    setPixel,
    setPixels,
    gridBounds,
    setSize,
    setPalette,
  };
}
