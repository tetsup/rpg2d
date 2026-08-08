import type { ReactNode } from 'react';

export type TitleBarProps = {
  category?: string;
  title?: string;
  subtitle?: string;
  rightSlot?: ReactNode;
};

export function TitleBar({ category, title, subtitle, rightSlot }: TitleBarProps) {
  return (
    <header className="shrink-0 p-1">
      <div className="rounded-xl border bg-card px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            {title && <h1 className="truncate text-lg font-semibold">{title}</h1>}

            {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
          </div>

          {category && <span className="shrink-0 text-xs text-muted-foreground">{category}</span>}

          <div className="flex shrink-0 items-center gap-2">{rightSlot}</div>
        </div>
      </div>
    </header>
  );
}
