import type { ReactNode } from 'react';
import { cn } from '@editor/lib/utils';

type PaintEditorLayoutProps = {
  canvas: ReactNode;
  fab?: ReactNode;
  toolbar: ReactNode;
  className?: string;
};

export function PaintEditorLayout({ canvas, fab, toolbar, className }: PaintEditorLayoutProps) {
  return (
    <div className={cn('flex h-full min-h-0 flex-col', className)}>
      <section className="relative flex min-h-0 flex-1 flex-col">
        {canvas}
        {fab}
      </section>
      <footer className="shrink-0 border-t border-border bg-background px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {toolbar}
      </footer>
    </div>
  );
}
