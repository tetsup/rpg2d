import { useTranslation } from 'react-i18next';
import { useLayoutStore } from '@editor/app/stores/edit-state';

export type TitleBarProps = {
  category?: string;
  title?: string;
  subtitle?: string;
  rightSlot?: React.ReactNode;
};

export function TitleBar({ category, title, subtitle, rightSlot }: TitleBarProps) {
  const { t } = useTranslation();
  const { isDirty } = useLayoutStore((s) => s.editState);

  return (
    <header className="shrink-0 p-1">
      <div className="rounded-xl border bg-card px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <h1 className="mt-1 truncate text-lg font-semibold">{title}</h1>
          {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
          <span className="text-xs text-muted-foreground">{category}</span>
          <div className="flex items-center gap-2">
            {isDirty != null &&
              (isDirty ? (
                <span className="text-xs font-medium text-amber-500">● {t('未保存')}</span>
              ) : (
                <span className="text-xs font-medium text-emerald-500">● {t('保存済')}</span>
              ))}

            {rightSlot}
          </div>
        </div>
      </div>
    </header>
  );
}
