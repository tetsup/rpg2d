import type { Color, Variant } from './types';

const buttonColorMap = {
  filled: {
    neutral: 'bg-neutral text-neutral-foreground hover:opacity-90',
    accent: 'bg-accent text-accent-foreground hover:opacity-90',
    success: 'bg-success text-success-foreground hover:opacity-90',
    warning: 'bg-warning text-warning-foreground hover:opacity-90',
    danger: 'bg-danger text-danger-foreground hover:opacity-90',
    info: 'bg-info text-info-foreground hover:opacity-90',
  },

  outlined: {
    neutral: 'border border-neutral text-neutral bg-transparent hover:bg-neutral/10',
    accent: 'border border-accent text-accent bg-transparent hover:bg-accent/10',
    success: 'border border-success text-success bg-transparent hover:bg-success/10',
    warning: 'border border-warning text-warning bg-transparent hover:bg-warning/10',
    danger: 'border border-danger text-danger bg-transparent hover:bg-danger/10',
    info: 'border border-info text-info bg-transparent hover:bg-info/10',
  },

  text: {
    neutral: 'text-neutral bg-transparent hover:bg-neutral/10',
    accent: 'text-accent bg-transparent hover:bg-accent/10',
    success: 'text-success bg-transparent hover:bg-success/10',
    warning: 'text-warning bg-transparent hover:bg-warning/10',
    danger: 'text-danger bg-transparent hover:bg-danger/10',
    info: 'text-info bg-transparent hover:bg-info/10',
  },
} satisfies Record<Variant, Record<Color, string>>;

export function buttonColorClass(variant: Variant, color: Color) {
  return buttonColorMap[variant][color];
}
