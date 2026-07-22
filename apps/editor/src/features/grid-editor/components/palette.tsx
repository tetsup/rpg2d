import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@base/lib/utils';

export type PaletteItem<TKey extends string = string> = {
  key: TKey;
  label: string;
};

type PaletteProps<TItem extends PaletteItem> = {
  items: TItem[];
  selectedKey?: TItem['key'];
  onSelect?: (key: TItem['key']) => void;
  deleteMode?: boolean;
  onDelete?: (key: TItem['key']) => void;
  renderItem: (item: TItem) => ReactNode;
  className?: string;
  emptyLabel?: string;
};

export function Palette<TItem extends PaletteItem>({
  items,
  selectedKey,
  onSelect,
  deleteMode = false,
  onDelete,
  renderItem,
  className,
  emptyLabel,
}: PaletteProps<TItem>) {
  const { t } = useTranslation();

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
            onClick={() => {
              if (deleteMode) {
                onDelete?.(item.key);
              } else {
                onSelect?.(item.key);
              }
            }}
            className={cn(
              'relative flex size-8 items-center justify-center overflow-hidden rounded border',
              selected ? 'border-primary ring-2 ring-primary/40' : 'border-border'
            )}
            aria-label={item.label}
            aria-pressed={!deleteMode ? selected : undefined}
          >
            {renderItem(item)}

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
