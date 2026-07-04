import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import type { ResourceRecord } from '@sharedTypes/database/collection';
import { CanvasViewport } from '@editor/components/features/paint-editor/canvas-viewport';
import { ContextNavigatorFab, type ContextChip } from '@editor/components/features/paint-editor/context-navigator-fab';
import { DrawResourcePopup } from '@editor/components/features/paint-editor/draw-resource-popup';
import { GraphicsSaveDialog } from '@editor/components/features/paint-editor/graphics-save-dialog';
import { OperationModeGroup } from '@editor/components/features/paint-editor/operation-mode-group';
import { PaintEditorLayout } from '@editor/components/features/paint-editor/paint-editor-layout';
import { PaintEditorToolbar } from '@editor/components/features/paint-editor/paint-editor-toolbar';
import { SaveToolbarMenu } from '@editor/components/features/paint-editor/save-toolbar-menu';
import { ZoomPopup } from '@editor/components/features/paint-editor/zoom-popup';
import { ImageSizeDialog } from '@editor/components/features/graphics/image-size-dialog';
import {
  buildColorSwatchItems,
  renderImageEditorCore,
  useImageEditorState,
} from '@editor/components/features/graphics/image-editor-core';
import { LayoutShell } from '@editor/components/features/layout/layout-shell';
import { createEmptyImageData } from '@editor/lib/empty-image-data';
import { createEmptyTextureData } from '@editor/lib/empty-texture-data';
import { getResourceContextLabel } from '@editor/lib/graphics-context-label';
import { addPaletteColor, removePaletteColor } from '@editor/lib/image-palette-mutate';
import { getDefaultPaletteToken } from '@editor/lib/image-pixel-mutate';
import {
  buildSaveLayerItems,
  executeGraphicsSave,
  getSaveLayerItem,
  type GraphicsSaveContext,
} from '@editor/lib/graphics-save-plan';
import { resolvePaletteForNewImage } from '@editor/lib/graphics-palette-match';
import { findResourceTypeGroup, resourceTypeMeta } from '@editor/lib/resource-type-meta';
import type { SaveLayerScope } from '@editor/lib/paint-editor/save-layer';
import { reserveGraphicsResourceDraft } from '@editor/lib/reserve-graphics-resource';
import {
  SKIN_DIRECTION_LABELS,
  SKIN_DIRECTIONS,
  type SkinDirection,
} from '@editor/lib/skin-directions';
import {
  appendImageToDefaultLayer,
  getDefaultLayerImageIds,
} from '@editor/lib/texture-layers';
import { useSkinValidation, useTextureValidation } from '@editor/lib/graphics-meta-validation';
import { useUpdateDocument } from '@editor/hooks/api/mutations';
import { useDocumentById } from '@editor/hooks/api/by-id';
import { useResolvedDocuments } from '@editor/hooks/api/resolved-documents';
import {
  GraphicsEditorSessionProvider,
  useGraphicsEditorSession,
} from '@editor/providers/graphics-editor-session-provider';
import {
  selectAnyDirty,
  selectSkinDirty,
  selectTextureDirty,
} from '@editor/stores/graphics-editor-session';
import { useLayoutStore } from '@editor/stores/edit-state';

type GraphicsEditorProps = {
  resource: ResourceRecord<'skin' | 'texture' | 'image'>;
};

export function GraphicsEditor({ resource }: GraphicsEditorProps) {
  return (
    <GraphicsEditorSessionProvider resource={resource}>
      <GraphicsEditorShell resource={resource} />
    </GraphicsEditorSessionProvider>
  );
}

function GraphicsEditorShell({ resource }: GraphicsEditorProps) {
  const { t } = useTranslation();
  const group = findResourceTypeGroup(resource.type);
  const meta = resourceTypeMeta[resource.type];

  return (
    <LayoutShell
      flush
      titleBarProps={{
        title: resource.name,
        category: group ? t(group.title) : undefined,
        subtitle: meta.label,
      }}
    >
      <GraphicsEditorContent entryResource={resource} />
    </LayoutShell>
  );
}

function GraphicsEditorContent({
  entryResource,
}: {
  entryResource: ResourceRecord<'skin' | 'texture' | 'image'>;
}) {
  const { t } = useTranslation();
  const { mutateAsync: updateResource, isPending } = useUpdateDocument('resources');
  const setEditState = useLayoutStore((state) => state.setEditState);
  const viewportRef = useRef<HTMLDivElement>(null);

  const entryType = useGraphicsEditorSession((s) => s.entryType);
  const namespace = useGraphicsEditorSession((s) => s.namespace);
  const activeDirection = useGraphicsEditorSession((s) => s.activeDirection);
  const activeFrameId = useGraphicsEditorSession((s) => s.activeFrameId);
  const skinDraft = useGraphicsEditorSession((s) => s.skinDraft);
  const skinIsDraft = useGraphicsEditorSession((s) => s.skinIsDraft);
  const textureDraft = useGraphicsEditorSession((s) => s.textureDraft);
  const textureIsDraft = useGraphicsEditorSession((s) => s.textureIsDraft);
  const imageDirty = useGraphicsEditorSession((s) => s.imageDirty);
  const skinDirty = useGraphicsEditorSession(selectSkinDirty);
  const textureDirty = useGraphicsEditorSession(selectTextureDirty);
  const anyDirty = useGraphicsEditorSession(selectAnyDirty);
  const operationMode = useGraphicsEditorSession((s) => s.operationMode);
  const zoom = useGraphicsEditorSession((s) => s.zoom);

  const setActiveDirection = useGraphicsEditorSession((s) => s.setActiveDirection);
  const setActiveFrameId = useGraphicsEditorSession((s) => s.setActiveFrameId);
  const patchSkinDraft = useGraphicsEditorSession((s) => s.patchSkinDraft);
  const patchTextureDraft = useGraphicsEditorSession((s) => s.patchTextureDraft);
  const syncSkin = useGraphicsEditorSession((s) => s.syncSkin);
  const syncTexture = useGraphicsEditorSession((s) => s.syncTexture);
  const setSkinIsDraft = useGraphicsEditorSession((s) => s.setSkinIsDraft);
  const setTextureIsDraft = useGraphicsEditorSession((s) => s.setTextureIsDraft);
  const setImageDirty = useGraphicsEditorSession((s) => s.setImageDirty);
  const setOperationMode = useGraphicsEditorSession((s) => s.setOperationMode);
  const setZoom = useGraphicsEditorSession((s) => s.setZoom);

  const [sizeDialogOpen, setSizeDialogOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveScope, setSaveScope] = useState<SaveLayerScope | null>(null);

  const skinResource = entryType === 'skin' ? (entryResource as ResourceRecord<'skin'>) : undefined;
  const { data: skinFromQuery } = useDocumentById('resources', skinResource?.id);

  const textureIdFromSkin =
    entryType === 'skin' && skinDraft ? skinDraft.textures[activeDirection] : null;
  const textureId =
    entryType === 'texture' ? entryResource.id : entryType === 'skin' ? textureIdFromSkin : null;

  const { data: textureResource } = useDocumentById('resources', textureId ?? undefined);
  const syncedTextureId = useRef<string | null>(null);

  useEffect(() => {
    if (skinFromQuery?.type === 'skin') syncSkin(skinFromQuery);
  }, [skinFromQuery?.id, syncSkin, skinFromQuery]);

  useEffect(() => {
    if (textureResource?.type !== 'texture') {
      syncedTextureId.current = null;
      return;
    }
    if (syncedTextureId.current === textureResource.id) return;
    syncedTextureId.current = textureResource.id;
    syncTexture(textureResource);
  }, [textureResource, syncTexture]);

  const frameIds = useMemo(() => {
    if (entryType === 'image') return [entryResource.id];
    if (textureDraft == null) return [];
    return getDefaultLayerImageIds(textureDraft);
  }, [entryResource.id, entryType, textureDraft]);

  const resolvedFrames = useResolvedDocuments('resources', entryType === 'image' ? [] : frameIds);

  const activeImageId =
    entryType === 'image' ? entryResource.id : (activeFrameId ?? frameIds[0] ?? null);

  const { data: activeImageResource } = useDocumentById('resources', activeImageId ?? undefined);
  const activeImage = activeImageResource?.type === 'image' ? activeImageResource : undefined;

  const directionTextureIds = useMemo(() => {
    if (entryType !== 'skin' || skinDraft == null) return [];
    return SKIN_DIRECTIONS.map((direction) => skinDraft.textures[direction]).filter(
      (id): id is string => id != null
    );
  }, [entryType, skinDraft]);

  const resolvedDirectionTextures = useResolvedDocuments(
    'resources',
    entryType === 'skin' ? directionTextureIds : []
  );

  useEffect(() => {
    setEditState({ isDirty: anyDirty });
    return () => setEditState({});
  }, [anyDirty, setEditState]);

  const skinValidation = useSkinValidation(skinResource, skinDraft, skinIsDraft);
  const textureValidation = useTextureValidation(
    textureResource?.type === 'texture' ? textureResource : undefined,
    textureDraft,
    textureIsDraft
  );

  const guardSwitch = useCallback(() => {
    if (anyDirty) {
      toast.error(t('切り替える前に保存してください'));
      return false;
    }
    return true;
  }, [anyDirty, t]);

  const handleSelectDirection = (direction: SkinDirection) => {
    if (direction === activeDirection) return;
    if (!guardSwitch()) return;
    setActiveDirection(direction);
  };

  const handleSelectFrame = (frameId: string) => {
    if (frameId === activeImageId) return;
    if (!guardSwitch()) return;
    setActiveFrameId(frameId);
  };

  const handleAdd = async (size: { width: number; height: number }) => {
    setIsAdding(true);
    try {
      if (entryType === 'skin' && textureId == null) {
        const { id } = await reserveGraphicsResourceDraft({
          namespace,
          type: 'texture',
          parent: entryResource.name,
          hint: activeDirection,
          data: createEmptyTextureData(),
        });
        patchSkinDraft((current) => ({
          textures: { ...current.textures, [activeDirection]: id },
        }));
        toast.success(t('テクスチャを追加しました'));
        return;
      }

      if (textureResource?.type === 'texture' && textureDraft != null) {
        const siblingPalettes = resolvedFrames
          .filter((doc): doc is ResourceRecord<'image'> => doc?.type === 'image')
          .map((doc) => doc.data.palette);
        const emptyImage = createEmptyImageData(size.width, size.height);
        emptyImage.palette = resolvePaletteForNewImage({ sameTexturePalettes: siblingPalettes });

        const { id } = await reserveGraphicsResourceDraft({
          namespace,
          type: 'image',
          parent: textureResource.name,
          data: emptyImage,
        });
        patchTextureDraft((current) => appendImageToDefaultLayer(current, id));
        setActiveFrameId(id);
        toast.success(t('フレームを追加しました'));
      }
    } catch (error) {
      toast.error(`${t('作成に失敗しました')}: ${(error as Error).message}`);
    } finally {
      setIsAdding(false);
    }
  };

  const emptyLabel =
    entryType === 'skin' && textureId == null
      ? t('方向チップからテクスチャを追加してください')
      : entryType === 'texture' || (entryType === 'skin' && textureId != null)
        ? t('フレームチップからフレームを追加してください')
        : t('描画リソースから色を選んで編集してください');

  const directionItems = SKIN_DIRECTIONS.map((direction) => ({
    id: direction,
    label: t(SKIN_DIRECTION_LABELS[direction]),
    onSelect: () => handleSelectDirection(direction),
  }));

  const frameItems = frameIds.map((id, index) => {
    const frame = entryType === 'image' ? entryResource : resolvedFrames[index];
    const label =
      frame && 'name' in frame
        ? getResourceContextLabel(frame.name)
        : getResourceContextLabel(id.split('/').pop() ?? id);
    return { id, label, onSelect: () => handleSelectFrame(id) };
  });

  const showDirection = entryType === 'skin';
  const showFrames = entryType === 'texture' || (entryType === 'skin' && textureId != null);
  const showFrameAdd = entryType === 'texture' || (entryType === 'skin' && textureId != null);
  const showDirectionAdd = entryType === 'skin' && textureId == null;

  const activeFrameLabel = activeImage ? getResourceContextLabel(activeImage.name) : undefined;

  const frameResources = useMemo(
    () => resolvedFrames.filter((doc): doc is ResourceRecord<'image'> => doc?.type === 'image'),
    [resolvedFrames]
  );

  const hasDraftFrames = frameResources.some((frame) => frame.isDraft);
  const hasDraftTextures = resolvedDirectionTextures.some(
    (doc): doc is ResourceRecord<'texture'> => doc?.type === 'texture' && doc.isDraft
  );

  const openSaveDialog = (scope: SaveLayerScope) => {
    setSaveScope(scope);
    setSaveDialogOpen(true);
  };

  return (
    <KeyedImageEditorState
      key={activeImageId ?? 'empty'}
      activeImage={activeImage}
      onDirtyChange={setImageDirty}
    >
      {(imageState) => {
        const imageSlots = renderImageEditorCore({
          state: imageState,
          emptyLabel,
          operationMode,
        });

        const saveContext: GraphicsSaveContext = {
          entryType,
          imageResource: activeImage,
          imageDirty,
          imageIsDraft: imageState.isDraft,
          imageValidation: imageState.validation,
          textureResource: textureResource?.type === 'texture' ? textureResource : undefined,
          textureDirty,
          textureIsDraft,
          textureValidation,
          skinResource,
          skinDirty,
          skinIsDraft,
          skinValidation,
          frameResources,
          directionTextureResources: resolvedDirectionTextures,
        };

        const saveLayerItems = buildSaveLayerItems(saveContext, {
          image: t('画像'),
          texture: t('テクスチャ'),
          skin: t('スキン'),
        });

        const activeSaveItem = saveScope != null ? getSaveLayerItem(saveLayerItems, saveScope) : null;

        const dialogIsDraft =
          saveScope === 'skin'
            ? skinIsDraft
            : saveScope === 'texture'
              ? textureIsDraft
              : imageState.isDraft;

        const handleDialogDraftChange = (next: boolean) => {
          if (saveScope === 'skin') {
            setSkinIsDraft(next);
            return;
          }
          if (saveScope === 'texture') {
            setTextureIsDraft(next);
            return;
          }
          imageState.setIsDraft(next);
        };

        const handleSave = async () => {
          if (saveScope == null || activeSaveItem == null || !activeSaveItem.isValid) return;
          try {
            await executeGraphicsSave({
              scope: saveScope,
              context: saveContext,
              updateResource,
              syncTexture: (next) => syncTexture(next),
              syncSkin: (next) => syncSkin(next),
            });
            toast.success(t('保存しました'));
            setSaveDialogOpen(false);
          } catch (error) {
            toast.error(`${t('保存に失敗しました')}: ${(error as Error).message}`);
          }
        };

        const swatchItems = buildColorSwatchItems(imageState.draftData?.palette, imageState.selectedToken);

        const handleAddPaletteColor = () => {
          if (imageState.draftData == null) return;
          const result = addPaletteColor(imageState.draftData);
          if (result == null) {
            toast.error(t('これ以上色を追加できません'));
            return;
          }
          imageState.setDraftData(result.data);
          imageState.setSelectedToken(result.token);
        };

        const handleDeletePaletteColor = (token: string) => {
          if (imageState.draftData == null) return;
          const next = removePaletteColor(imageState.draftData, token);
          if (next == null) {
            toast.error(t('この色は削除できません'));
            return;
          }
          imageState.setDraftData(next);
          if (imageState.selectedToken === token) {
            imageState.setSelectedToken(getDefaultPaletteToken(next.palette));
          }
        };

        const contextChips: ContextChip[] = [
          ...(showDirection
            ? [
                {
                  id: 'direction',
                  label: t('方向'),
                  valueLabel: t(SKIN_DIRECTION_LABELS[activeDirection]),
                  items: directionItems,
                  activeId: activeDirection,
                  emptyLabel: t('方向がありません'),
                  showDraftDot: hasDraftTextures,
                  onAdd: showDirectionAdd ? () => setSizeDialogOpen(true) : undefined,
                  addDisabled: isAdding || isPending,
                },
              ]
            : []),
          ...(showFrames
            ? [
                {
                  id: 'frame',
                  label: t('フレーム'),
                  valueLabel: activeFrameLabel,
                  items: frameItems,
                  activeId: activeImageId ?? undefined,
                  emptyLabel: t('フレームがありません'),
                  showDirtyDot: imageDirty,
                  showDraftDot: hasDraftFrames,
                  onAdd: showFrameAdd ? () => setSizeDialogOpen(true) : undefined,
                  addDisabled: isAdding || isPending,
                },
              ]
            : []),
        ];

        return (
          <>
            <PaintEditorLayout
              canvas={
                <CanvasViewport
                  zoom={zoom}
                  operationMode={operationMode}
                  className="h-full"
                >
                  <div ref={viewportRef} className="w-full">
                    {imageSlots.canvas}
                  </div>
                </CanvasViewport>
              }
              fab={<ContextNavigatorFab chips={contextChips} />}
              toolbar={
                <PaintEditorToolbar
                  items={[
                    <OperationModeGroup key="mode" mode={operationMode} onModeChange={setOperationMode} />,
                    <DrawResourcePopup
                      key="palette"
                      items={swatchItems}
                      selectedKey={imageState.selectedToken}
                      onSelectKey={imageState.setSelectedToken}
                      onAdd={activeImage != null ? handleAddPaletteColor : undefined}
                      onDeleteKey={activeImage != null ? handleDeletePaletteColor : undefined}
                      addDisabled={imageState.draftData == null}
                      deleteDisabled={imageState.draftData == null || swatchItems.length <= 1}
                      emptyLabel={t('パレット未設定')}
                    />,
                    <ZoomPopup
                      key="zoom"
                      zoom={zoom}
                      onZoomChange={setZoom}
                      canvasWidth={imageSlots.canvasWidth}
                      canvasHeight={imageSlots.canvasHeight}
                      containerRef={viewportRef}
                    />,
                    <SaveToolbarMenu
                      key="save"
                      items={saveLayerItems}
                      saving={isPending}
                      showDirtyDot={anyDirty}
                      showDraftDot={hasDraftFrames || hasDraftTextures}
                      onSelectScope={openSaveDialog}
                    />,
                  ]}
                />
              }
            />

            <ImageSizeDialog open={sizeDialogOpen} onOpenChange={setSizeDialogOpen} onConfirm={handleAdd} />

            <GraphicsSaveDialog
              open={saveDialogOpen}
              onOpenChange={setSaveDialogOpen}
              scope={saveScope}
              item={activeSaveItem}
              isDraft={dialogIsDraft}
              onDraftChange={handleDialogDraftChange}
              description={imageState.description}
              onDescriptionChange={saveScope === 'image' ? imageState.setDescription : undefined}
              saving={isPending}
              onSave={handleSave}
            />
          </>
        );
      }}
    </KeyedImageEditorState>
  );
}

function KeyedImageEditorState({
  activeImage,
  onDirtyChange,
  children,
}: {
  activeImage: ResourceRecord<'image'> | undefined;
  onDirtyChange: (dirty: boolean) => void;
  children: (state: ReturnType<typeof useImageEditorState>) => React.ReactNode;
}) {
  const imageState = useImageEditorState(activeImage, onDirtyChange);
  return children(imageState);
}
