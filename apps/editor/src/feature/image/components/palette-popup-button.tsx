import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { RGBA } from '@sharedTypes/util/color';
import { ToolbarButton } from '@base/components/toolbar/toolbar-button';
import { ToolbarMenu } from '@base/components/toolbar/toolbar-menu';
import { PaletteIcon } from '@base/components/palette/palette-icon';
import type { usePaletteTool } from '../hooks/use-palette-tool';
import { Palette } from './palette';
import { ColorEditor } from './color-editor';

type PalettePopupButtonProps = {
  paletteTool: ReturnType<typeof usePaletteTool>;
  emptyLabel?: string;
  triggerLabel?: string;
};

export function PalettePopupButton({ paletteTool, emptyLabel, triggerLabel }: PalettePopupButtonProps) {
  const { t } = useTranslation();
  const [deleteMode, setDeleteMode] = useState(false);
  const paletteTitle = triggerLabel ?? t('描画リソース');

  return (
    <ToolbarMenu
      trigger={
        <ToolbarButton label={paletteTitle}>
          <PaletteIcon color={paletteTool.currentColor} />
        </ToolbarButton>
      }
      title={paletteTitle}
      description={t('描画に使う色を選びます')}
      side="top"
      align="center"
      size="sm"
      onOpenChange={() => {
        setDeleteMode(false);
      }}
      footer={
        <>
          <ToolbarButton
            outlined
            label={t('追加')}
            onClick={() => {
              paletteTool.create([0, 0, 0, 255]);
            }}
          >
            <Plus />
          </ToolbarButton>
          <ToolbarButton outlined label={t('削除モード')} active={deleteMode} onClick={() => setDeleteMode((v) => !v)}>
            <Trash2 />
          </ToolbarButton>
        </>
      }
    >
      <Palette
        items={paletteTool.items}
        selectedKey={deleteMode ? undefined : paletteTool.current}
        onSelect={paletteTool.setCurrent}
        onDelete={paletteTool.remove}
        deleteMode={deleteMode}
        emptyLabel={emptyLabel}
        renderItem={(item) => <PaletteIcon color={item.color} />}
      />
      <ColorEditor
        value={paletteTool.currentColor as RGBA}
        setValue={(next) => {
          paletteTool.change(paletteTool.current, next);
        }}
      />
    </ToolbarMenu>
  );
}
