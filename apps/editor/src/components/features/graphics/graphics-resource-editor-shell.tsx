import type { ReactNode } from 'react';
import { useRef, useState } from 'react';
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
import { useFitCellSize } from '@editor/hooks/ui/use-fit-cell-size';
import { useResetZoomOnImageChange } from '@editor/hooks/ui/use-reset-zoom-on-image-change';
import { buildPaletteSwatchItems } from '@editor/lib/palette-swatch-items';
import { toCellSize } from '@editor/lib/paint-editor/zoom';
import { getCompositeCanvasSize, type ImagePixelData } from '@editor/lib/pixel-render';
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
  emptyAction?: ReactNode;
};

export function GraphicsResourceEditorShell({
  type,
  title,
  images,
  palette,
  emptyLabel,
  emptyAction,
}: GraphicsResourceEditorShellProps) {
  const { t } = useTranslation();
  const meta = resourceTypeMeta[type];
  const group = findResourceTypeGroup(type);
  const isEmpty = (images?.length ?? 0) === 0;
  const viewportRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const canvasSize = getCompositeCanvasSize(images ?? []);
  const previewKey = isEmpty ? null : `${canvasSize.width}x${canvasSize.height}`;

  const fitCellSize = useFitCellSize({
    containerRef: viewportRef,
    canvasWidth: canvasSize.width,
    canvasHeight: canvasSize.height,
  });
  const cellSize = toCellSize(fitCellSize, zoom);

  useResetZoomOnImageChange(previewKey, setZoom);

  const swatchItems = buildPaletteSwatchItems(palette);

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
          <CanvasViewport containerRef={viewportRef} operationMode="paint" className="h-full">
            {isEmpty ? (
              <div className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
                <p>{emptyLabel}</p>
                {emptyAction}
              </div>
            ) : (
              <PixelCanvas className="w-full" images={images} cellSize={cellSize} emptyLabel={emptyLabel} />
            )}
          </CanvasViewport>
        }
        toolbar={
          <PaintEditorToolbar
            items={[
              <OperationModeGroup key="mode" mode="paint" onModeChange={() => undefined} />,
              <DrawResourcePopup key="palette" items={swatchItems} emptyLabel={t('パレット未設定')} />,
              <ZoomPopup key="zoom" zoom={zoom} onZoomChange={setZoom} />,
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
            ]}
          />
        }
      />
    </LayoutShell>
  );
}
