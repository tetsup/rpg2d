import type { Movement } from '@/schemas/action/movement';
import type { FieldState, Point2d } from '@/types/engine';
import type { Field } from '@/resource/domain/field';

export const checkEntityInhibit = (
  state: FieldState,
  samePos: (p1?: Point2d, p2?: Point2d) => boolean,
  dest: Point2d
): boolean => {
  return Object.values(state.entities).some(
    (entity) => !entity.state.allowOverwrap && samePos(dest, entity.state.pos.getDestination())
  );
};

export const checkTileReachable = (field: Field, dest: Point2d): boolean => {
  return field.checkReachable(dest);
};

export const checkReachable = (
  state: FieldState,
  field: Field,
  samePos: (p1?: Point2d, p2?: Point2d) => boolean,
  dest: Point2d
): boolean => {
  return checkTileReachable(field, dest) && !checkEntityInhibit(state, samePos, dest);
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
