import { useTranslation } from 'react-i18next';
import { useLayoutStore } from '@editor/stores/header';

export function Titlebar() {
  const { t } = useTranslation();
  const {
    header: { categoryKey, titleKey, subtitle, isDirty },
  } = useLayoutStore();

  return (
    <header className="p-3">
      <div className="rounded-xl border bg-card px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{categoryKey && categoryKey}</span>
          {isDirty != null &&
            (isDirty ? (
              <span className="text-xs font-medium text-amber-500">● {t('未保存')}</span>
            ) : (
              <span className="text-xs font-medium text-emerald-500">● {t('保存済')}</span>
            ))}
        </div>
        <h1 className="mt-1 truncate text-lg font-semibold">{titleKey && t(titleKey)}</h1>
        {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
      </div>
    </header>
  );
}
