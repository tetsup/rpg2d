import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { LayoutShell } from '@editor/components/features/layout/layout-shell';
import { AddButton } from '@editor/components/features/graphics/add-button';
import { GraphicsEditorLayout } from '@editor/components/features/graphics/graphics-editor-layout';
import { PalettePanel } from '@editor/components/features/graphics/palette-panel';
import { PixelCanvas } from '@editor/components/features/graphics/pixel-canvas';
import { SwitcherPopup } from '@editor/components/features/graphics/switcher-popup';
import { ToolBar } from '@editor/components/features/graphics/toolbar';
import type { ImagePixelData } from '@editor/lib/pixel-render';
import {
  findResourceTypeGroup,
  resourceTypeMeta,
  type GraphicsResourceType,
} from '@editor/lib/resource-type-meta';

type GraphicsResourceEditorShellProps = {
  type: GraphicsResourceType;
  title: string;
  images?: ImagePixelData[];
  palette?: ImagePixelData['palette'];
  emptyLabel: string;
  switcherLabel: string;
  addButton?: ReactNode;
  switcherDisabled?: boolean;
};

function getSwitcherLabel(type: GraphicsResourceType, t: (key: string) => string): string {
  switch (type) {
    case 'image':
      return t('画像');
    case 'texture':
      return t('フレーム');
    case 'skin':
      return t('方向');
  }
}

export function GraphicsResourceEditorShell({
  type,
  title,
  images,
  palette,
  emptyLabel,
  switcherLabel,
  addButton,
  switcherDisabled = false,
}: GraphicsResourceEditorShellProps) {
  const { t } = useTranslation();
  const meta = resourceTypeMeta[type];
  const group = findResourceTypeGroup(type);

  return (
    <LayoutShell
      flush
      titleBarProps={{
        title,
        category: group ? t(group.title) : undefined,
        subtitle: meta.label,
      }}
    >
      <GraphicsEditorLayout
        canvas={<PixelCanvas className="w-full" images={images} emptyLabel={emptyLabel} />}
        switcher={
          <SwitcherPopup
            label={switcherLabel}
            description={t('{{label}}を切り替えます', { label: switcherLabel })}
            disabled={switcherDisabled}
          />
        }
        toolbar={<ToolBar />}
        palette={<PalettePanel palette={palette} />}
        addButton={addButton ?? <AddButton />}
      />
    </LayoutShell>
  );
}

export { getSwitcherLabel };
