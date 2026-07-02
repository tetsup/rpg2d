import { Pencil } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@editor/components/ui/button';
import { cn } from '@editor/lib/utils';

type ToolBarProps = {
  className?: string;
};

export function ToolBar({ className }: ToolBarProps) {
  const { t } = useTranslation();

  return (
    <div className={cn('flex shrink-0 items-center gap-1', className)} role="toolbar" aria-label={t('描画ツール')}>
      <Button type="button" variant="outline" size="icon-sm" disabled aria-pressed="true">
        <Pencil className="size-4" />
        <span className="sr-only">{t('ペン')}</span>
      </Button>
    </div>
  );
}
