import { useState } from 'react';
import { Point2d } from '@sharedTypes/engine';
import { useScreen } from './screen';

type UseHandToolProps = {
  screen: ReturnType<typeof useScreen>;
};

export const useHandTool = ({ screen }: UseHandToolProps) => {
  const [isPointerDown, setIsPointerDown] = useState(false);
  const [prevScreenPos, setPrevScreenPos] = useState<Point2d | null>(null);

  const onPointerDown = screen.createPointerHandler((e) => {
    setIsPointerDown(true);
    setPrevScreenPos(e.screen);
  });

  const onPointerMove = screen.createPointerHandler((e) => {
    if (!isPointerDown || !prevScreenPos) return;
    screen.panBy(e.screen.x - prevScreenPos.x, e.screen.y - prevScreenPos.y);
    setPrevScreenPos(e.screen);
  });

  const onPointerUp = screen.createPointerHandler(() => {
    setIsPointerDown(false);
  });

  return { pointerHandlers: { onPointerDown, onPointerMove, onPointerUp } };
};
