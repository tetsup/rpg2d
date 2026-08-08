import type { Color, Variant } from './types';

const badgeColorMap = {
  filled: {
    neutral: 'bg-neutral text-neutral-foreground',
    accent: 'bg-accent text-accent-foreground',
    success: 'bg-success text-success-foreground',
    warning: 'bg-warning text-warning-foreground',
    danger: 'bg-danger text-danger-foreground',
    info: 'bg-info text-info-foreground',
  },

  outlined: {
    neutral: 'border border-neutral text-neutral',
    accent: 'border border-accent text-accent',
    success: 'border border-success text-success',
    warning: 'border border-warning text-warning',
    danger: 'border border-danger text-danger',
    info: 'border border-info text-info',
  },

  text: {
    neutral: 'text-neutral',
    accent: 'text-accent',
    success: 'text-success',
    warning: 'text-warning',
    danger: 'text-danger',
    info: 'text-info',
  },
} satisfies Record<Variant, Record<Color, string>>;

export function badgeColorClass(variant: Variant, color: Color) {
  return badgeColorMap[variant][color];
}
