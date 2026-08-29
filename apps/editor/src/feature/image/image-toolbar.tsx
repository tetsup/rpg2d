import { useTranslation } from 'react-i18next';
import { Hand, Paintbrush } from 'lucide-react';
import { Toolbar } from '@base/components/toolbar/toolbar';
import { ToolbarGroup } from '@base/components/toolbar/toolbar-group';
import { ToolbarSeparator } from '@base/components/toolbar/toolbar-separator';
import { ToolbarButton } from '@base/components/toolbar/toolbar-button';
import type { useToolSet } from './hooks/use-tool-set';
import { PalettePopupButton } from './components/palette-popup-button';
import { ZoomPopupButton } from './components/zoom-popup-button';
import { ResourceSaveButton } from '../resource/resource-save-button';

type ImageToolbarProps = {
  toolSet: ReturnType<typeof useToolSet>;
};

export function ImageToolbar({ toolSet }: ImageToolbarProps) {
  const { t } = useTranslation();

  return (
    <Toolbar>
      <ToolbarGroup>
        <ToolbarButton label={t('移動')} active={toolSet.mode === 'hand'} onClick={() => toolSet.setMode('hand')}>
          <Hand />
        </ToolbarButton>
        <ToolbarButton label={t('ペン')} active={toolSet.mode === 'pen'} onClick={() => toolSet.setMode('pen')}>
          <Paintbrush />
        </ToolbarButton>
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <PalettePopupButton paletteTool={toolSet.paletteTool} emptyLabel={t('パレット未設定')} />
        <ZoomPopupButton zoomTool={toolSet.zoomTool} />
        <ResourceSaveButton />
      </ToolbarGroup>
    </Toolbar>
  );
}
