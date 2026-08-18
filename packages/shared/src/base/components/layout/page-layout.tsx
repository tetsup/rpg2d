import type { ReactNode } from 'react';
import { cn } from '@base/lib/utils';

type PageLayoutProps = {
  header?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  flush?: boolean;
};

export function PageLayout({ header, footer, children, flush = false }: PageLayoutProps) {
  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      {header}
      <main className={cn('min-h-0 flex-1', flush ? 'flex flex-col overflow-hidden' : 'overflow-auto')}>
        {flush ? (
          <div className="flex min-h-0 flex-1">{children}</div>
        ) : (
          <div className="space-y-4 p-4">{children}</div>
        )}
      </main>
      {footer}
    </div>
  );
}
