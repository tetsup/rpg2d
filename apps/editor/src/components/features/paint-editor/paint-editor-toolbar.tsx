import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@editor/lib/utils';

type PaintEditorToolbarProps = {
  items: ReactNode[];
  className?: string;
};

export function PaintEditorToolbar({ items, className }: PaintEditorToolbarProps) {
  const { t } = useTranslation();

  return (
    <div
      className={cn('flex items-center gap-1 overflow-x-auto', className)}
      role="toolbar"
      aria-label={t('描画ツール')}
    >
      {items.map((item, index) => (
        <div key={index} className="contents">
          {item}
        </div>
      ))}
    </div>
  );
}
