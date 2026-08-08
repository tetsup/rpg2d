import type { ReactNode } from 'react';

type CanvasLayoutProps = {
  viewport: ReactNode;
  footer?: ReactNode;
};

export function CanvasLayout({ viewport, footer }: CanvasLayoutProps) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <section className="relative flex min-h-0 flex-1 flex-col">{viewport}</section>

      {footer && (
        <footer className="shrink-0 border-t border-border bg-background px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          {footer}
        </footer>
      )}
    </div>
  );
}
