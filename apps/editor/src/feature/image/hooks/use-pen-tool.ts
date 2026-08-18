import { useState } from 'react';
import type { Point2d } from '@sharedTypes/engine';
import type { useImageData } from './use-image-data';
import { useScreen } from './use-screen';
import { usePaletteTool } from './use-palette-tool';

type UsePenToolProps = {
  image: ReturnType<typeof useImageData>;
  screen: ReturnType<typeof useScreen>;
  paletteTool: ReturnType<typeof usePaletteTool>;
};

export const usePenTool = ({ image, screen, paletteTool }: UsePenToolProps) => {
  const [isPointerDown, setIsPointerDown] = useState(false);
  const [prevGrid, setPrevGrid] = useState<Point2d | null>(null);

  const write = (grid: Point2d) => {
    if (!image.setPixel(grid, paletteTool.current)) return;
    screen.redrawCell(grid);
    setPrevGrid(grid);
  };

  const onPointerDown = screen.createPointerHandler((e) => {
    e.originalEvent.currentTarget.setPointerCapture(e.originalEvent.pointerId);
    setIsPointerDown(true);
    write(e.grid);
  });

  const onPointerMove = screen.createPointerHandler((e) => {
    if (!isPointerDown || (prevGrid && prevGrid.x === e.grid.x && prevGrid.y === e.grid.y)) return;
    write(e.grid);
  });

  const onPointerUp = screen.createPointerHandler(() => {
    setIsPointerDown(false);
  });

  return { pointerHandlers: { onPointerDown, onPointerMove, onPointerUp } };
};
