import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import type { ResourceRecord } from '@sharedTypes/database/collection';
import { Settings2 } from 'lucide-react';
import { AddButton } from '@editor/components/features/graphics/add-button';
import { GraphicsContextList } from '@editor/components/features/graphics/graphics-context-list';
import { GraphicsEditorLayout } from '@editor/components/features/graphics/graphics-editor-layout';
import { GraphicsMetaSheet } from '@editor/components/features/graphics/graphics-meta-sheet';
import { useSkinValidation, useTextureValidation } from '@editor/lib/graphics-meta-validation';
import { GraphicsPartialSaveButton } from '@editor/components/features/graphics/graphics-partial-save-button';
import { renderImageEditorCore, useImageEditorState } from '@editor/components/features/graphics/image-editor-core';
import { ImageSizeDialog } from '@editor/components/features/graphics/image-size-dialog';
import { SwitcherPopup } from '@editor/components/features/graphics/switcher-popup';
import { LayoutShell } from '@editor/components/features/layout/layout-shell';
import { Button } from '@editor/components/ui/button';
import { createEmptyImageData } from '@editor/lib/empty-image-data';
import { createEmptyTextureData } from '@editor/lib/empty-texture-data';
import { getResourceContextLabel } from '@editor/lib/graphics-context-label';
import { resolvePaletteForNewImage } from '@editor/lib/graphics-palette-match';
import { findResourceTypeGroup, resourceTypeMeta } from '@editor/lib/resource-type-meta';
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

  const entryType = useGraphicsEditorSession((s) => s.entryType);
  const namespace = useGraphicsEditorSession((s) => s.namespace);
  const activeDirection = useGraphicsEditorSession((s) => s.activeDirection);
  const activeFrameId = useGraphicsEditorSession((s) => s.activeFrameId);
  const skinDraft = useGraphicsEditorSession((s) => s.skinDraft);
  const skinIsDraft = useGraphicsEditorSession((s) => s.skinIsDraft);
  const textureDraft = useGraphicsEditorSession((s) => s.textureDraft);
  const textureIsDraft = useGraphicsEditorSession((s) => s.textureIsDraft);
  const metaPanel = useGraphicsEditorSession((s) => s.metaPanel);
  const imageDirty = useGraphicsEditorSession((s) => s.imageDirty);
  const skinDirty = useGraphicsEditorSession(selectSkinDirty);
  const textureDirty = useGraphicsEditorSession(selectTextureDirty);
  const anyDirty = useGraphicsEditorSession(selectAnyDirty);

  const setActiveDirection = useGraphicsEditorSession((s) => s.setActiveDirection);
  const setActiveFrameId = useGraphicsEditorSession((s) => s.setActiveFrameId);
  const patchSkinDraft = useGraphicsEditorSession((s) => s.patchSkinDraft);
  const patchTextureDraft = useGraphicsEditorSession((s) => s.patchTextureDraft);
  const syncSkin = useGraphicsEditorSession((s) => s.syncSkin);
  const syncTexture = useGraphicsEditorSession((s) => s.syncTexture);
  const setSkinIsDraft = useGraphicsEditorSession((s) => s.setSkinIsDraft);
  const setTextureIsDraft = useGraphicsEditorSession((s) => s.setTextureIsDraft);
  const setImageDirty = useGraphicsEditorSession((s) => s.setImageDirty);
  const openMeta = useGraphicsEditorSession((s) => s.openMeta);
  const closeMeta = useGraphicsEditorSession((s) => s.closeMeta);

  const [sizeDialogOpen, setSizeDialogOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const skinResource = entryType === 'skin' ? (entryResource as ResourceRecord<'skin'>) : undefined;
  const { data: skinFromQuery } = useDocumentById('resources', skinResource?.id);

  const textureIdFromSkin =
    entryType === 'skin' && skinDraft ? skinDraft.textures[activeDirection] : null;
  const textureId =
    entryType === 'texture'
      ? entryResource.id
      : entryType === 'skin'
        ? textureIdFromSkin
        : null;

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

  const resolvedFrames = useResolvedDocuments(
    'resources',
    entryType === 'image' ? [] : frameIds
  );

  const activeImageId =
    entryType === 'image' ? entryResource.id : (activeFrameId ?? frameIds[0] ?? null);

  const { data: activeImageResource } = useDocumentById('resources', activeImageId ?? undefined);
  const activeImage = activeImageResource?.type === 'image' ? activeImageResource : undefined;

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

  const handleSaveTexture = async () => {
    if (textureValidation == null || !textureValidation.success || textureResource?.type !== 'texture') {
      return;
    }
    try {
      await updateResource({ id: textureResource.id, body: textureValidation.data });
      syncTexture({
        ...textureResource,
        data: textureValidation.data.data,
        isDraft: textureValidation.data.isDraft,
      });
      toast.success(t('テクスチャを保存しました'));
    } catch (error) {
      toast.error(`${t('保存に失敗しました')}: ${(error as Error).message}`);
    }
  };

  const handleSaveSkin = async () => {
    if (skinValidation == null || !skinValidation.success || skinResource == null) return;
    try {
      await updateResource({ id: skinResource.id, body: skinValidation.data });
      syncSkin({
        ...skinResource,
        data: skinValidation.data.data,
        isDraft: skinValidation.data.isDraft,
      });
      toast.success(t('スキンを保存しました'));
    } catch (error) {
      toast.error(`${t('保存に失敗しました')}: ${(error as Error).message}`);
    }
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
      ? t('＋ボタンからテクスチャを追加してください')
      : entryType === 'texture' || (entryType === 'skin' && textureId != null)
        ? t('＋ボタンからフレームを追加してください')
        : t('＋ボタンから画像を追加してください');

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
  const showAdd =
    entryType === 'skin' ? textureId == null || showFrames : entryType === 'texture';

  const activeFrameLabel = activeImage ? getResourceContextLabel(activeImage.name) : undefined;

  return (
    <KeyedImageEditorState
      key={activeImageId ?? 'empty'}
      activeImage={activeImage}
      onDirtyChange={setImageDirty}
    >
      {(imageState) => {
        const imageSlots = renderImageEditorCore({ state: imageState, emptyLabel });

        const handleSaveImage = async () => {
          if (activeImage == null || imageState.validation == null || !imageState.validation.success) return;
          try {
            await updateResource({ id: activeImage.id, body: imageState.validation.data });
            toast.success(t('画像を保存しました'));
          } catch (error) {
            toast.error(`${t('保存に失敗しました')}: ${(error as Error).message}`);
          }
        };

        return (
          <>
            <GraphicsEditorLayout
              canvas={imageSlots.canvas}
              switcher={
                <>
                  {showDirection && (
                    <SwitcherPopup
                      label={t('方向')}
                      valueLabel={t(SKIN_DIRECTION_LABELS[activeDirection])}
                      description={t('方向を切り替えます')}
                    >
                      <GraphicsContextList
                        items={directionItems}
                        activeId={activeDirection}
                        emptyLabel={t('方向がありません')}
                      />
                    </SwitcherPopup>
                  )}
                  {showFrames && (
                    <SwitcherPopup
                      label={t('フレーム')}
                      valueLabel={activeFrameLabel}
                      description={t('フレームを切り替えます')}
                      disabled={frameIds.length === 0}
                    >
                      <GraphicsContextList
                        items={frameItems}
                        activeId={activeImageId ?? undefined}
                        emptyLabel={t('フレームがありません')}
                      />
                    </SwitcherPopup>
                  )}
                </>
              }
              contextActions={
                <div className="flex shrink-0 items-center gap-1">
                  {activeImage != null && (
                    <>
                      <GraphicsPartialSaveButton
                        label={t('画像')}
                        dirty={imageDirty}
                        valid={imageState.validation?.success ?? false}
                        saving={isPending}
                        onSave={handleSaveImage}
                      />
                      <Button type="button" variant="outline" size="sm" onClick={() => openMeta('image')}>
                        <Settings2 className="size-4" />
                        <span className="sr-only">{t('画像情報')}</span>
                      </Button>
                    </>
                  )}
                  {textureDraft != null && textureResource?.type === 'texture' && (
                    <>
                      <GraphicsPartialSaveButton
                        label={t('テクスチャ')}
                        dirty={textureDirty}
                        valid={textureValidation?.success ?? false}
                        saving={isPending}
                        onSave={handleSaveTexture}
                      />
                      <Button type="button" variant="outline" size="sm" onClick={() => openMeta('texture')}>
                        <Settings2 className="size-4" />
                        <span className="sr-only">{t('テクスチャ情報')}</span>
                      </Button>
                    </>
                  )}
                  {skinResource != null && skinDraft != null && (
                    <>
                      <GraphicsPartialSaveButton
                        label={t('スキン')}
                        dirty={skinDirty}
                        valid={skinValidation?.success ?? false}
                        saving={isPending}
                        onSave={handleSaveSkin}
                      />
                      <Button type="button" variant="outline" size="sm" onClick={() => openMeta('skin')}>
                        <Settings2 className="size-4" />
                        <span className="sr-only">{t('スキン情報')}</span>
                      </Button>
                    </>
                  )}
                </div>
              }
              toolbar={imageSlots.toolbar}
              palette={imageSlots.palette}
              addButton={
                showAdd ? (
                  <AddButton disabled={isAdding || isPending} onClick={() => setSizeDialogOpen(true)} />
                ) : undefined
              }
            />

            <ImageSizeDialog open={sizeDialogOpen} onOpenChange={setSizeDialogOpen} onConfirm={handleAdd} />

            <GraphicsMetaSheet
              panel={metaPanel}
              skinResource={skinResource}
              textureResource={textureResource?.type === 'texture' ? textureResource : undefined}
              imageResource={activeImage}
              skinDraft={skinDraft ?? undefined}
              skinIsDraft={skinIsDraft}
              textureDraft={textureDraft ?? undefined}
              textureIsDraft={textureIsDraft}
              imageIsDraft={imageState.isDraft}
              onSkinChange={(data, isDraft) => {
                patchSkinDraft(() => data);
                setSkinIsDraft(isDraft);
              }}
              onTextureChange={(data, isDraft) => {
                patchTextureDraft(() => data);
                setTextureIsDraft(isDraft);
              }}
              onImageChange={(isDraft) => imageState.setIsDraft(isDraft)}
              onClose={closeMeta}
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
