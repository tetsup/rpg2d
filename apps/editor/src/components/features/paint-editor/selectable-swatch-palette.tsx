import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@editor/lib/utils';

export type SwatchPaletteItem<TKey extends string = string> = {
  key: TKey;
  label: string;
  swatch: ReactNode;
  isDraft?: boolean;
  isDirty?: boolean;
};

type SelectableSwatchPaletteProps<TKey extends string> = {
  items: SwatchPaletteItem<TKey>[];
  selectedKey?: TKey;
  onSelectKey?: (key: TKey) => void;
  deleteMode?: boolean;
  onDeleteKey?: (key: TKey) => void;
  className?: string;
  emptyLabel?: string;
};

export function SelectableSwatchPalette<TKey extends string>({
  items,
  selectedKey,
  onSelectKey,
  deleteMode = false,
  onDeleteKey,
  className,
  emptyLabel,
}: SelectableSwatchPaletteProps<TKey>) {
  const { t } = useTranslation();
  const selectable = onSelectKey != null;

  if (items.length === 0) {
    return <p className="text-xs text-muted-foreground">{emptyLabel ?? t('パレット未設定')}</p>;
  }

  return (
    <div className={cn('flex flex-wrap gap-1', className)}>
      {items.map((item) => {
        const selected = item.key === selectedKey;
        return (
          <button
            key={item.key}
            type="button"
            disabled={!selectable && !deleteMode}
            onClick={() => {
              if (deleteMode) {
                onDeleteKey?.(item.key);
                return;
              }
              onSelectKey?.(item.key);
            }}
            className={cn(
              'relative size-8 rounded border [image-rendering:pixelated]',
              selected ? 'border-primary ring-2 ring-primary/40' : 'border-border',
              !selectable && !deleteMode && 'opacity-80'
            )}
            aria-label={item.label}
            aria-pressed={selectable ? selected : undefined}
          >
            <span className="flex size-full items-center justify-center overflow-hidden rounded-[inherit]">{item.swatch}</span>
            {item.isDraft && !deleteMode && (
              <span className="absolute bottom-0 right-0 rounded-tl bg-sky-500 px-0.5 text-[8px] leading-none text-white">
                D
              </span>
            )}
            {deleteMode && (
              <span className="absolute -bottom-0.5 -right-0.5 flex size-3.5 items-center justify-center rounded-full bg-destructive text-[10px] leading-none text-white">
                ×
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
