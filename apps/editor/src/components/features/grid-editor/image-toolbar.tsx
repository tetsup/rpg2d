import { useTranslation } from 'react-i18next';
import { Hand, Paintbrush } from 'lucide-react';
import { ResourcePath } from '@sharedTypes/resource/common';
import { useToolSet } from '@editor/hooks/grid-editor/tool-set';
import { Separator } from '@editor/components/ui/separator';
import { ToolbarIconButton } from './toolbar-icon-button';
import { PalettePopupButton } from './palette-popup-button';
import { ZoomPopupButton } from './zoom-popup-button';
import { SavePopupButton } from './save-popup-button';

type ImageToolbarProps = {
  toolSet: ReturnType<typeof useToolSet>;
  defaultPath?: ResourcePath;
};

export function ImageToolbar({ toolSet, defaultPath }: ImageToolbarProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-2 overflow-x-auto">
      <ToolbarIconButton
        icon={<Hand />}
        label={t('移動')}
        isActive={toolSet.mode === 'hand'}
        onClick={() => {
          toolSet.setMode('hand');
        }}
      />
      <ToolbarIconButton
        icon={<Paintbrush />}
        label={t('ペン')}
        isActive={toolSet.mode === 'pen'}
        onClick={() => {
          toolSet.setMode('pen');
        }}
      />
      <Separator orientation="vertical" className="mx-1 h-6" />
      <PalettePopupButton paletteTool={toolSet.paletteTool} emptyLabel={t('パレット未設定')} />
      <ZoomPopupButton zoomTool={toolSet.zoomTool} />
      <SavePopupButton defaultPath={defaultPath} />
    </div>
  );
}
