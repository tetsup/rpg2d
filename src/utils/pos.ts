import type { Movement } from '@/schemas/actions/movement';
import type { Direction2d, Point2d } from '@/types/engine';

export const move = (current: Point2d, direction: Direction2d) => {
  switch (direction) {
    case 'left':
      return { x: current.x - 1, y: current.y };
    case 'right':
      return { x: current.x + 1, y: current.y };
    case 'up':
      return { x: current.x, y: current.y - 1 };
    case 'down':
      return { x: current.x, y: current.y + 1 };
  }
};

export const samePos = (p1?: Point2d, p2?: Point2d) => p1?.x == p2?.x && p1?.y == p2?.y;

export const calcDest = (current: Point2d, movement: Movement) =>
  movement.command === 'walk' ? move(current, movement.direction) : movement.dest;
