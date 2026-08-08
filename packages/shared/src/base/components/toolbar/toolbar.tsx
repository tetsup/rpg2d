import type { ReactNode } from 'react';
import { cn } from '@base/lib/utils';

type ToolbarSize = 'sm' | 'md' | 'lg';

type ToolbarProps = {
  size?: ToolbarSize;
  children: ReactNode;
};

const toolbarSizeClass = {
  sm: ['[--toolbar-button-size:2.25rem]', '[--toolbar-icon-size:1rem]', '[--toolbar-gap:0.375rem]'],
  md: [
    '[--toolbar-button-size:var(--touch-size)]',
    '[--toolbar-icon-size:calc(var(--touch-size)*0.5)]',
    '[--toolbar-gap:0.5rem]',
  ],
  lg: ['[--toolbar-button-size:3.5rem]', '[--toolbar-icon-size:1.5rem]', '[--toolbar-gap:0.75rem]'],
};

export function Toolbar({ children, size }: ToolbarProps) {
  return <div className={cn('flex items-center overflow-x-auto', toolbarSizeClass[size ?? 'md'])}>{children}</div>;
}
