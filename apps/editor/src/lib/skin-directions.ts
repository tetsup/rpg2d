export const SKIN_DIRECTIONS = ['down', 'up', 'left', 'right'] as const;

export type SkinDirection = (typeof SKIN_DIRECTIONS)[number];

export const SKIN_DIRECTION_LABELS: Record<SkinDirection, string> = {
  down: '下',
  up: '上',
  left: '左',
  right: '右',
};
