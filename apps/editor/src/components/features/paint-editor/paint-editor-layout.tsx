import type { ReactNode } from 'react';
import { cn } from '@editor/lib/utils';

type PaintEditorLayoutProps = {
  canvas: ReactNode;
  toolbar: ReactNode;
  className?: string;
};

export function PaintEditorLayout({ canvas, toolbar, className }: PaintEditorLayoutProps) {
  return (
    <div className={cn('flex h-full min-h-0 flex-col', className)}>
      <section className="relative flex min-h-0 flex-1 flex-col">{canvas}</section>
      <footer className="shrink-0 border-t border-border bg-background p-2">{toolbar}</footer>
    </div>
  );
}
