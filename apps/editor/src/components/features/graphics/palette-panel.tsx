import { useTranslation } from 'react-i18next';
import { cn } from '@editor/lib/utils';
import type { ImagePixelData } from '@editor/lib/pixel-render';

type PalettePanelProps = {
  palette?: ImagePixelData['palette'];
  className?: string;
};

export function PalettePanel({ palette, className }: PalettePanelProps) {
  const { t } = useTranslation();
  const entries = palette ? Object.entries(palette) : [];

  return (
    <div className={cn('min-w-0 flex-1', className)} aria-label={t('パレット')}>
      {entries.length === 0 ? (
        <p className="text-xs text-muted-foreground">{t('パレット未設定')}</p>
      ) : (
        <div className="flex flex-wrap gap-1">
          {entries.map(([token, rgba]) => (
            <button
              key={token}
              type="button"
              disabled
              className="size-6 rounded border border-border [image-rendering:pixelated]"
              style={{ backgroundColor: `rgba(${rgba.join(',')})` }}
              aria-label={token}
            />
          ))}
        </div>
      )}
    </div>
  );
}
