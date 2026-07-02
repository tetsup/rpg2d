import { useTranslation } from 'react-i18next';
import { Navigate, useParams } from 'react-router-dom';
import { LayoutShell } from '@editor/components/features/layout/layout-shell';
import { AddButton } from '@editor/components/features/graphics/add-button';
import { GraphicsEditorLayout } from '@editor/components/features/graphics/graphics-editor-layout';
import { PalettePanel } from '@editor/components/features/graphics/palette-panel';
import { PixelCanvas } from '@editor/components/features/graphics/pixel-canvas';
import { SwitcherPopup } from '@editor/components/features/graphics/switcher-popup';
import { ToolBar } from '@editor/components/features/graphics/toolbar';
import {
  findResourceTypeGroup,
  isGraphicsResourceType,
  resourceTypeMeta,
  type GraphicsResourceType,
} from '@editor/lib/resource-type-meta';

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

export function NewGraphicsResourcePage() {
  const { t } = useTranslation();
  const { type } = useParams<{ type: string }>();

  if (type == null || !isGraphicsResourceType(type)) {
    return <Navigate to="/resources" replace />;
  }

  const meta = resourceTypeMeta[type];
  const group = findResourceTypeGroup(type);
  const switcherLabel = getSwitcherLabel(type, t);

  return (
    <LayoutShell
      flush
      titleBarProps={{
        title: t('{{label}}を作成', { label: meta.label }),
        category: group ? t(group.title) : undefined,
      }}
    >
      <GraphicsEditorLayout
          canvas={
            <PixelCanvas
              className="w-full"
              emptyLabel={t('＋ボタンから画像を追加してください')}
            />
          }
          switcher={
            <SwitcherPopup
              label={switcherLabel}
              description={t('{{label}}を切り替えます', { label: switcherLabel })}
              disabled
            />
          }
          toolbar={<ToolBar />}
          palette={<PalettePanel />}
          addButton={<AddButton />}
        />
    </LayoutShell>
  );
}
