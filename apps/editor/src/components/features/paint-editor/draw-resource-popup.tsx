import { useState, type ReactNode } from 'react';
import { Palette, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AddButton } from '@editor/components/features/graphics/add-button';
import { Button } from '@editor/components/ui/button';
import {
  AnchoredEditorMenu,
  AnchoredEditorMenuContent,
  AnchoredEditorMenuTrigger,
} from './anchored-editor-menu';
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
  const [open, setOpen] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const editable = onAdd != null || onDeleteKey != null;
  const paletteTitle = triggerLabel ?? t('描画リソース');

  return (
    <AnchoredEditorMenu
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) setDeleteMode(false);
      }}
    >
      <AnchoredEditorMenuTrigger
        render={
          <ToolbarIconButton
            icon={triggerIcon ?? <Palette />}
            label={paletteTitle}
          />
        }
      />
      <AnchoredEditorMenuContent
        title={paletteTitle}
        description={t('描画に使う色を選びます')}
        side="top"
        align="center"
        className="max-w-sm"
        footer={
          editable ? (
            <div className="flex gap-1">
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
          ) : undefined
        }
      >
        <SelectableSwatchPalette
          items={items}
          selectedKey={deleteMode ? undefined : selectedKey}
          onSelectKey={deleteMode ? undefined : onSelectKey}
          deleteMode={deleteMode}
          onDeleteKey={onDeleteKey}
          emptyLabel={emptyLabel}
        />
      </AnchoredEditorMenuContent>
    </AnchoredEditorMenu>
  );
}
