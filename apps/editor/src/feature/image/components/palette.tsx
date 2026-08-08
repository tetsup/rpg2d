import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { PaletteLayout } from '@base/components/palette/palette-layout';
import { PaletteItemButton } from '@base/components/palette/palette-item-button';

type PaletteItem<T extends Record<string, any> = {}> = {
  key: string;
} & T;

type PaletteProps<TItem extends PaletteItem> = {
  items: TItem[];
  selectedKey?: TItem['key'];
  onSelect: (key: TItem['key']) => void;
  deleteMode?: boolean;
  onDelete?: (key: TItem['key']) => void;
  renderItem: (item: TItem) => ReactNode;
  emptyLabel?: string;
};

export function Palette<TItem extends PaletteItem>({
  items,
  selectedKey,
  onSelect,
  deleteMode = false,
  onDelete,
  renderItem,
  emptyLabel,
}: PaletteProps<TItem>) {
  const { t } = useTranslation();

  if (items.length === 0) {
    return <p className="text-xs text-muted-foreground">{emptyLabel ?? t('パレット未設定')}</p>;
  }

  return (
    <PaletteLayout>
      {items.map((item) => (
        <PaletteItemButton
          selected={item.key === selectedKey}
          deleteMode={deleteMode}
          onSelect={() => {
            onSelect(item.key);
          }}
          onDelete={() => {
            onDelete?.(item.key);
          }}
        >
          {renderItem(item)}
        </PaletteItemButton>
      ))}
    </PaletteLayout>
  );
}
