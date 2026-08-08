import type { Color } from './types';

const dotColorMap = {
  neutral: 'bg-neutral',
  accent: 'bg-accent',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  info: 'bg-info',
} satisfies Record<Color, string>;

export function dotColorClass(color: Color) {
  return dotColorMap[color];
}
