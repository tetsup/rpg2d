import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@editor/components/ui/button';
import { usePaletteTool } from '@editor/hooks/grid-editor/palette-tool';
import { AnchoredEditorMenu, AnchoredEditorMenuContent, AnchoredEditorMenuTrigger } from './anchored-editor-menu';
import { ToolbarIconButton } from './toolbar-icon-button';
import { rgbaToCss } from '@editor/lib/color';
import { Palette } from './palette';
import { RGBA } from '@sharedTypes/util/color';
import { ColorEditor } from './color-editor';
import { ColorSwatch } from './color-swatch';

type PalettePopupButtonProps = {
  paletteTool: ReturnType<typeof usePaletteTool>;
  emptyLabel?: string;
  triggerLabel?: string;
};

function PaletteTriggerIcon({ color }: { color?: number[] }) {
  const cssColor = rgbaToCss((color ?? [0, 0, 0, 0]) as RGBA);
  return <ColorSwatch color={cssColor} className="size-6 rounded-xs" />;
}

export function PalettePopupButton({ paletteTool, emptyLabel, triggerLabel }: PalettePopupButtonProps) {
  const { t } = useTranslation();

  const [open, setOpen] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);

  const paletteTitle = triggerLabel ?? t('描画リソース');

  return (
    <AnchoredEditorMenu
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);

        if (!nextOpen) {
          setDeleteMode(false);
        }
      }}
    >
      <AnchoredEditorMenuTrigger
        render={
          <ToolbarIconButton icon={<PaletteTriggerIcon color={paletteTool.currentColor} />} label={paletteTitle} />
        }
      />

      <AnchoredEditorMenuContent
        title={paletteTitle}
        description={t('描画に使う色を選びます')}
        side="top"
        align="center"
        className="max-w-sm"
        footer={
          <div className="flex gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              onClick={() => {
                paletteTool.create([0, 0, 0, 255]);
              }}
              className="shrink-0"
              aria-label={t('追加')}
            >
              <Plus className="size-4" />
            </Button>

            <Button
              type="button"
              variant={deleteMode ? 'secondary' : 'outline'}
              size="icon-sm"
              disabled={paletteTool.items.length === 0}
              onClick={() => setDeleteMode((v) => !v)}
              aria-label={t('色を削除')}
              aria-pressed={deleteMode}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        }
      >
        <Palette
          items={paletteTool.items}
          selectedKey={deleteMode ? undefined : paletteTool.current}
          onSelect={deleteMode ? undefined : paletteTool.setCurrent}
          deleteMode={deleteMode}
          onDelete={paletteTool.remove}
          emptyLabel={emptyLabel}
          renderItem={(item) => <PaletteTriggerIcon color={item.color} />}
        />
        <ColorEditor
          value={paletteTool.currentColor as RGBA}
          setValue={(next) => {
            paletteTool.change(paletteTool.current, next);
          }}
        />
      </AnchoredEditorMenuContent>
    </AnchoredEditorMenu>
  );
}
