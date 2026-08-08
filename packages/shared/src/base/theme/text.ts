import type { Color } from './types';

const textColorMap = {
  neutral: 'text-neutral',
  accent: 'text-accent',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
  info: 'text-info',
} satisfies Record<Color, string>;

export function textColorClass(color: Color) {
  return textColorMap[color];
}
