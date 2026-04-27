import type { InputManager } from '@tetsup/web2d';
import type { Direction2d, RpgKey } from '@/types/engine';

export const resolveMove = (input: InputManager<RpgKey>): Direction2d | null => {
  if (input.isPressed('left')) return 'left';
  if (input.isPressed('right')) return 'right';
  if (input.isPressed('up')) return 'up';
  if (input.isPressed('down')) return 'down';
  return null;
};
