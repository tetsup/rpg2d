import type { ReactNode } from 'react';
import { Palette } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AddButton } from '@editor/components/features/graphics/add-button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@editor/components/ui/dialog';
import { SelectableSwatchPalette, type SwatchPaletteItem } from './selectable-swatch-palette';
import { ToolbarIconButton } from './toolbar-icon-button';

type DrawResourcePopupProps<TKey extends string = string> = {
  items: SwatchPaletteItem<TKey>[];
  selectedKey?: TKey;
  onSelectKey?: (key: TKey) => void;
  onAdd?: () => void;
  addDisabled?: boolean;
  emptyLabel?: string;
  triggerIcon?: ReactNode;
  triggerLabel?: string;
};

export function DrawResourcePopup<TKey extends string>({
  items,
  selectedKey,
  onSelectKey,
  onAdd,
  addDisabled = true,
  emptyLabel,
  triggerIcon,
  triggerLabel,
}: DrawResourcePopupProps<TKey>) {
  const { t } = useTranslation();

  return (
    <Dialog>
      <DialogTrigger
        render={
          <ToolbarIconButton
            icon={triggerIcon ?? <Palette className="size-4" />}
            label={triggerLabel ?? t('描画リソース')}
          />
        }
      />
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{triggerLabel ?? t('描画リソース')}</DialogTitle>
          <DialogDescription>{t('描画に使う色を選びます')}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <SelectableSwatchPalette
            items={items}
            selectedKey={selectedKey}
            onSelectKey={onSelectKey}
            emptyLabel={emptyLabel}
          />
          {onAdd != null && (
            <div className="flex justify-end">
              <AddButton disabled={addDisabled} onClick={onAdd} label={t('色を追加')} />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function colorSwatchItems(
  palette: Record<string, [number, number, number, number]> | undefined,
  selectedToken?: string
): SwatchPaletteItem[] {
  if (palette == null) return [];
  return Object.entries(palette).map(([token, rgba]) => ({
    key: token,
    label: token,
    swatch: (
      <span
        className="block size-full"
        style={{ backgroundColor: `rgba(${rgba.join(',')})` }}
      />
    ),
    isDraft: false,
    isDirty: token === selectedToken,
  }));
}
