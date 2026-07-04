import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { LayoutShell } from '@editor/components/features/layout/layout-shell';
import { PixelCanvas } from '@editor/components/features/graphics/pixel-canvas';
import { CanvasViewport } from '@editor/components/features/paint-editor/canvas-viewport';
import { DrawResourcePopup } from '@editor/components/features/paint-editor/draw-resource-popup';
import { OperationModeGroup } from '@editor/components/features/paint-editor/operation-mode-group';
import { PaintEditorLayout } from '@editor/components/features/paint-editor/paint-editor-layout';
import { PaintEditorToolbar } from '@editor/components/features/paint-editor/paint-editor-toolbar';
import { SaveToolbarMenu } from '@editor/components/features/paint-editor/save-toolbar-menu';
import { ZoomPopup } from '@editor/components/features/paint-editor/zoom-popup';
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
  addButton?: React.ReactNode;
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
  addButton,
}: GraphicsResourceEditorShellProps) {
  const { t } = useTranslation();
  const meta = resourceTypeMeta[type];
  const group = findResourceTypeGroup(type);

  const swatchItems =
    palette != null
      ? Object.entries(palette).map(([token, rgba]) => ({
          key: token,
          label: token,
          swatch: (
            <span
              className="block size-full"
              style={{ backgroundColor: `rgba(${rgba.join(',')})` }}
            />
          ),
        }))
      : [];

  return (
    <LayoutShell
      flush
      titleBarProps={{
        title,
        category: group ? t(group.title) : undefined,
        subtitle: meta.label,
      }}
    >
      <PaintEditorLayout
        canvas={
          <CanvasViewport zoom={1} operationMode="paint" className="h-full">
            <PixelCanvas className="w-full" images={images} emptyLabel={emptyLabel} />
          </CanvasViewport>
        }
        toolbar={
          <PaintEditorToolbar
            items={[
              <OperationModeGroup key="mode" mode="paint" onModeChange={() => undefined} />,
              <DrawResourcePopup key="palette" items={swatchItems} emptyLabel={t('パレット未設定')} />,
              <ZoomPopup key="zoom" zoom={1} onZoomChange={() => undefined} />,
              <SaveToolbarMenu
                key="save"
                items={[
                  {
                    scope: 'image',
                    label: t('画像'),
                    isDirty: false,
                    isValid: true,
                    hasDraftDescendants: false,
                    draftChildren: [],
                    invalidMessages: [],
                  },
                ]}
                saving={false}
                onSelectScope={() => undefined}
              />,
              addButton,
            ].filter(Boolean)}
          />
        }
      />
    </LayoutShell>
  );
}

export { getSwitcherLabel };
