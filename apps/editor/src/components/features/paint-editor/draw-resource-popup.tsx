import { useState, type ReactNode } from 'react';
import { Palette, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AddButton } from '@editor/components/features/graphics/add-button';
import { Button } from '@editor/components/ui/button';
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
  onDeleteKey?: (key: TKey) => void;
  addDisabled?: boolean;
  deleteDisabled?: boolean;
  emptyLabel?: string;
  triggerIcon?: ReactNode;
  triggerLabel?: string;
};

export function DrawResourcePopup<TKey extends string>({
  items,
  selectedKey,
  onSelectKey,
  onAdd,
  onDeleteKey,
  addDisabled = false,
  deleteDisabled = false,
  emptyLabel,
  triggerIcon,
  triggerLabel,
}: DrawResourcePopupProps<TKey>) {
  const { t } = useTranslation();
  const [deleteMode, setDeleteMode] = useState(false);
  const editable = onAdd != null || onDeleteKey != null;

  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) setDeleteMode(false);
      }}
    >
      <DialogTrigger
        render={
          <ToolbarIconButton
            icon={triggerIcon ?? <Palette />}
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
            selectedKey={deleteMode ? undefined : selectedKey}
            onSelectKey={deleteMode ? undefined : onSelectKey}
            deleteMode={deleteMode}
            onDeleteKey={onDeleteKey}
            emptyLabel={emptyLabel}
          />
          {editable && (
            <div className="flex justify-end gap-1">
              {onAdd != null && (
                <AddButton disabled={addDisabled} onClick={onAdd} label={t('色を追加')} />
              )}
              {onDeleteKey != null && (
                <Button
                  type="button"
                  variant={deleteMode ? 'secondary' : 'outline'}
                  size="icon-sm"
                  disabled={deleteDisabled || items.length === 0}
                  onClick={() => setDeleteMode((current) => !current)}
                  aria-label={t('色を削除')}
                  aria-pressed={deleteMode}
                >
                  <Trash2 className="size-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
