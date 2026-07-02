import { useTranslation } from 'react-i18next';
import { cn } from '@editor/lib/utils';
import type { ImagePixelData } from '@editor/lib/pixel-render';

type PalettePanelProps = {
  palette?: ImagePixelData['palette'];
  selectedToken?: string;
  onSelectToken?: (token: string) => void;
  className?: string;
};

export function PalettePanel({ palette, selectedToken, onSelectToken, className }: PalettePanelProps) {
  const { t } = useTranslation();
  const entries = palette ? Object.entries(palette) : [];
  const selectable = onSelectToken != null;

  return (
    <div className={cn('min-w-0 flex-1', className)} aria-label={t('パレット')}>
      {entries.length === 0 ? (
        <p className="text-xs text-muted-foreground">{t('パレット未設定')}</p>
      ) : (
        <div className="flex flex-wrap gap-1">
          {entries.map(([token, rgba]) => {
            const selected = token === selectedToken;
            return (
              <button
                key={token}
                type="button"
                disabled={!selectable}
                onClick={() => onSelectToken?.(token)}
                className={cn(
                  'size-6 rounded border [image-rendering:pixelated]',
                  selected ? 'border-primary ring-2 ring-primary/40' : 'border-border',
                  !selectable && 'opacity-80'
                )}
                style={{ backgroundColor: `rgba(${rgba.join(',')})` }}
                aria-label={token}
                aria-pressed={selectable ? selected : undefined}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
