import type { ReactNode } from 'react';
import { cn } from '@editor/lib/utils';

export type GraphicsEditorSlots = {
  canvas: ReactNode;
  saveBar?: ReactNode;
  toolbar?: ReactNode;
  palette?: ReactNode;
  switcher?: ReactNode;
  addButton?: ReactNode;
  /** Partial save buttons and meta open buttons */
  contextActions?: ReactNode;
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
  saveBar,
  toolbar,
  palette,
  switcher,
  addButton,
  contextActions,
  className,
}: GraphicsEditorLayoutProps) {
  const bottomItems = [
    { key: 'switcher', node: switcher },
    { key: 'contextActions', node: contextActions },
    { key: 'toolbar', node: toolbar },
    { key: 'palette', node: palette },
    { key: 'addButton', node: addButton },
  ].filter((item) => item.node != null);

  return (
    <div className={cn('flex h-full min-h-0 flex-col', className)}>
      <section className="flex min-h-0 flex-1 items-center justify-center p-2">{canvas}</section>
      {saveBar}
      {bottomItems.length > 0 && (
        <footer className="shrink-0 border-t border-border bg-background p-2">
          <div className="flex items-end gap-2 overflow-x-auto">
            {bottomItems.map((item) => (
              <div key={item.key} className="contents">
                {item.node}
              </div>
            ))}
          </div>
        </footer>
      )}
    </div>
  );
}
