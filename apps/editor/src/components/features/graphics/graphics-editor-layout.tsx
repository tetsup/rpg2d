import type { ReactNode } from 'react';
import { cn } from '@editor/lib/utils';

export type GraphicsEditorSlots = {
  canvas: ReactNode;
  toolbar?: ReactNode;
  palette?: ReactNode;
  switcher?: ReactNode;
  addButton?: ReactNode;
};

type GraphicsEditorLayoutProps = GraphicsEditorSlots & {
  className?: string;
};

/**
 * Mobile-first graphics editor shell. Layout slots are separate from editor logic
 * so a future desktop variant can reuse the same state/hooks with different placement.
 */
export function GraphicsEditorLayout({
  canvas,
  toolbar,
  palette,
  switcher,
  addButton,
  className,
}: GraphicsEditorLayoutProps) {
  const bottomItems = [switcher, toolbar, palette, addButton].filter(Boolean);

  return (
    <div className={cn('flex h-full min-h-0 flex-col', className)}>
      <section className="flex min-h-0 flex-1 items-center justify-center p-2">{canvas}</section>
      {bottomItems.length > 0 && (
        <footer className="shrink-0 border-t border-border bg-background p-2">
          <div className="flex items-end gap-2 overflow-x-auto">{bottomItems}</div>
        </footer>
      )}
    </div>
  );
}
