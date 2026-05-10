import type { InputManager } from '@tetsup/web2d';
import type { Movement } from '@/schemas/action/movement';
import type { FieldState, Point2d, Direction2d, RpgKey } from '@/types/engine';
import type { Field } from '@/resource/domain/field';

const checkEntityInhibit = (
  state: FieldState,
  samePos: (p1?: Point2d, p2?: Point2d) => boolean,
  dest: Point2d
): boolean => {
  return Object.values(state.entities).some(
    (entity) => !entity.state.allowOverwrap && samePos(dest, entity.state.pos.getDestination())
  );
};

const checkReachable = (
  state: FieldState,
  field: Field,
  samePos: (p1?: Point2d, p2?: Point2d) => boolean,
  dest: Point2d
): boolean => {
  return field.checkReachable(dest) && !checkEntityInhibit(state, samePos, dest);
};

export const movePlayer = (
  state: FieldState,
  field: Field,
  calcDest: (current: Point2d, movement: Movement) => Point2d,
  samePos: (p1?: Point2d, p2?: Point2d) => boolean,
  nowMs: number,
  movement: Movement
) => {
  if (state.playerPos.currentMovement != null) return;
  if (movement.command === 'walk') state.playerPos.setDirection(movement.direction);
  if (checkReachable(state, field, samePos, calcDest(state.playerPos.current, movement)))
    state.playerPos.move(nowMs, movement);
};

export const moveEntity = (
  state: FieldState,
  field: Field,
  calcDest: (current: Point2d, movement: Movement) => Point2d,
  samePos: (p1?: Point2d, p2?: Point2d) => boolean,
  nowMs: number,
  entityId: string,
  movement: Movement
) => {
  const entity = state.entities[entityId];
  if (entity.state.pos.currentMovement != null) return;
  if (movement.command === 'walk') entity.state.pos.setDirection(movement.direction);
  const dest = calcDest(entity.state.pos.current, movement);
  if (checkReachable(state, field, samePos, dest) && !samePos(state.playerPos.getDestination(), dest))
    entity.state.pos.move(nowMs, movement);
};

export const resolveMove = (input: InputManager<RpgKey>): Direction2d | null => {
  if (input.isPressed('left')) return 'left';
  if (input.isPressed('right')) return 'right';
  if (input.isPressed('up')) return 'up';
  if (input.isPressed('down')) return 'down';
  return null;
};
