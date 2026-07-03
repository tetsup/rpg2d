import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { createResourceInputSchema } from '@schema/database/resource';
import type { ResourceRecord } from '@sharedTypes/database/collection';
import { AddButton } from '@editor/components/features/graphics/add-button';
import { GraphicsContextList } from '@editor/components/features/graphics/graphics-context-list';
import { GraphicsEditorLayout } from '@editor/components/features/graphics/graphics-editor-layout';
import { GraphicsSaveBar } from '@editor/components/features/graphics/graphics-save-bar';
import { ImageSizeDialog } from '@editor/components/features/graphics/image-size-dialog';
import { PalettePanel } from '@editor/components/features/graphics/palette-panel';
import { PixelCanvas } from '@editor/components/features/graphics/pixel-canvas';
import { SwitcherPopup } from '@editor/components/features/graphics/switcher-popup';
import { ToolBar } from '@editor/components/features/graphics/toolbar';
import { LayoutShell } from '@editor/components/features/layout/layout-shell';
import { createEmptyImageData } from '@editor/lib/empty-image-data';
import { getResourceContextLabel } from '@editor/lib/graphics-context-label';
import { resolvePaletteForNewImage } from '@editor/lib/graphics-palette-match';
import { getDefaultPaletteToken, setImagePixel } from '@editor/lib/image-pixel-mutate';
import { findResourceTypeGroup, resourceTypeMeta } from '@editor/lib/resource-type-meta';
import { reserveGraphicsResourceDraft } from '@editor/lib/reserve-graphics-resource';
import {
  appendImageToDefaultLayer,
  getDefaultLayerImageIds,
} from '@editor/lib/texture-layers';
import { useUpdateDocument } from '@editor/hooks/api/mutations';
import { useResolvedDocuments } from '@editor/hooks/api/resolved-documents';
import { useLayoutStore } from '@editor/stores/edit-state';

type TextureGraphicsEditorProps = {
  resource: ResourceRecord<'texture'>;
  /** When nested inside skin editor, omit outer shell. */
  embedded?: boolean;
};

export function TextureGraphicsEditor({ resource, embedded = false }: TextureGraphicsEditorProps) {
  return <TextureGraphicsEditorBody key={resource.id} resource={resource} embedded={embedded} />;
}

export function TextureGraphicsEditorBody({ resource, embedded = false }: TextureGraphicsEditorProps) {
  const { t } = useTranslation();
  const { mutateAsync: updateResource, isPending } = useUpdateDocument('resources');
  const setEditState = useLayoutStore((state) => state.setEditState);

  const [draftTexture, setDraftTexture] = useState(resource.data);
  const [textureDraftMode, setTextureDraftMode] = useState(resource.isDraft);
  const [activeFrameIndex, setActiveFrameIndex] = useState(0);
  const [sizeDialogOpen, setSizeDialogOpen] = useState(false);
  const [isAddingFrame, setIsAddingFrame] = useState(false);

  const frameIds = useMemo(() => getDefaultLayerImageIds(draftTexture), [draftTexture]);
  const resolvedFrames = useResolvedDocuments('resources', frameIds);
  const activeFrame = resolvedFrames[activeFrameIndex];
  const activeImage = activeFrame?.type === 'image' ? activeFrame : undefined;

  const [imageDraft, setImageDraft] = useState(activeImage?.data);
  const [imageDraftMode, setImageDraftMode] = useState(activeImage?.isDraft ?? true);
  const [selectedToken, setSelectedToken] = useState(() =>
    activeImage ? getDefaultPaletteToken(activeImage.data.palette) : 'ff'
  );

  useEffect(() => {
    if (activeImage == null) {
      setImageDraft(undefined);
      return;
    }
    setImageDraft(activeImage.data);
    setImageDraftMode(activeImage.isDraft);
    setSelectedToken(getDefaultPaletteToken(activeImage.data.palette));
  }, [activeImage?.id, activeImage?.data, activeImage?.isDraft]);

  useEffect(() => {
    if (activeFrameIndex >= frameIds.length && frameIds.length > 0) {
      setActiveFrameIndex(frameIds.length - 1);
    }
  }, [activeFrameIndex, frameIds.length]);

  const textureDirty = useMemo(() => {
    return (
      textureDraftMode !== resource.isDraft ||
      JSON.stringify(draftTexture) !== JSON.stringify(resource.data)
    );
  }, [draftTexture, resource.data, resource.isDraft, textureDraftMode]);

  const imageDirty = useMemo(() => {
    if (activeImage == null || imageDraft == null) return false;
    return (
      imageDraftMode !== activeImage.isDraft ||
      JSON.stringify(imageDraft) !== JSON.stringify(activeImage.data)
    );
  }, [activeImage, imageDraft, imageDraftMode]);

  const textureValidation = useMemo(() => {
    return createResourceInputSchema('texture').safeParse({
      namespace: resource.namespace,
      type: 'texture',
      name: resource.name,
      version: resource.version,
      description: resource.description,
      isDraft: textureDraftMode,
      data: draftTexture,
    });
  }, [draftTexture, resource.description, resource.name, resource.namespace, resource.version, textureDraftMode]);

  const imageValidation = useMemo(() => {
    if (activeImage == null || imageDraft == null) return null;
    return createResourceInputSchema('image').safeParse({
      namespace: activeImage.namespace,
      type: 'image',
      name: activeImage.name,
      version: activeImage.version,
      description: activeImage.description,
      isDraft: imageDraftMode,
      data: imageDraft,
    });
  }, [activeImage, imageDraft, imageDraftMode]);

  const isDirty = textureDirty || imageDirty;
  const isValid = textureValidation.success && (imageValidation == null || imageValidation.success);

  useEffect(() => {
    setEditState({ isDirty });
    return () => setEditState({});
  }, [isDirty, setEditState]);

  const handleSave = async () => {
    if (!textureValidation.success) return;
    if (imageValidation != null && !imageValidation.success) return;

    try {
      if (imageDirty && imageValidation != null) {
        await updateResource({ id: activeImage!.id, body: imageValidation.data });
      }
      if (textureDirty) {
        await updateResource({ id: resource.id, body: textureValidation.data });
      }
      toast.success(t('保存しました'));
    } catch (error) {
      console.error(error);
      toast.error(`${t('保存に失敗しました')}: ${(error as Error).message}`);
    }
  };

  const handleSelectFrame = (index: number) => {
    if (index === activeFrameIndex) return;
    if (imageDirty) {
      toast.error(t('フレームを切り替える前に保存してください'));
      return;
    }
    setActiveFrameIndex(index);
  };

  const handleAddFrame = async (size: { width: number; height: number }) => {
    setIsAddingFrame(true);
    try {
      const siblingPalettes = resolvedFrames
        .filter((doc): doc is ResourceRecord<'image'> => doc?.type === 'image')
        .map((doc) => doc.data.palette);

      const palette = resolvePaletteForNewImage({ sameTexturePalettes: siblingPalettes });
      const emptyImage = createEmptyImageData(size.width, size.height);
      emptyImage.palette = palette;

      const { id } = await reserveGraphicsResourceDraft({
        namespace: resource.namespace,
        type: 'image',
        parent: resource.name,
        data: emptyImage,
      });

      setDraftTexture((current) => appendImageToDefaultLayer(current, id));
      setActiveFrameIndex(frameIds.length);
      toast.success(t('フレームを追加しました'));
    } catch (error) {
      console.error(error);
      toast.error(`${t('作成に失敗しました')}: ${(error as Error).message}`);
    } finally {
      setIsAddingFrame(false);
    }
  };

  const frameItems = frameIds.map((id, index) => {
    const frame = resolvedFrames[index];
    const label =
      frame?.type === 'image'
        ? getResourceContextLabel(frame.name)
        : getResourceContextLabel(id.split('/').pop() ?? id);
    return {
      id,
      label,
      onSelect: () => handleSelectFrame(index),
    };
  });

  const activeFrameLabel =
    activeImage != null ? getResourceContextLabel(activeImage.name) : undefined;

  const editorLayout = (
    <>
      <GraphicsEditorLayout
        canvas={
          imageDraft != null ? (
            <PixelCanvas
              className="w-full"
              image={imageDraft}
              activeToken={selectedToken}
              onPaint={(x, y) => {
                setImageDraft((current) =>
                  current ? setImagePixel(current, x, y, selectedToken) : current
                );
              }}
            />
          ) : (
            <PixelCanvas
              className="w-full"
              emptyLabel={t('＋ボタンからフレームを追加してください')}
            />
          )
        }
        saveBar={
          <GraphicsSaveBar
            isDraft={textureDraftMode}
            onDraftChange={(next) => {
              setTextureDraftMode(next);
              setImageDraftMode(next);
            }}
            isDirty={isDirty}
            isValid={isValid}
            isSaving={isPending}
            onSave={handleSave}
          />
        }
        switcher={
          <SwitcherPopup
            label={t('フレーム')}
            valueLabel={activeFrameLabel}
            description={t('フレームを切り替えます')}
            disabled={frameIds.length === 0}
          >
            <GraphicsContextList
              items={frameItems}
              activeId={frameIds[activeFrameIndex]}
              emptyLabel={t('フレームがありません')}
            />
          </SwitcherPopup>
        }
        toolbar={<ToolBar />}
        palette={
          <PalettePanel
            palette={imageDraft?.palette}
            selectedToken={selectedToken}
            onSelectToken={imageDraft != null ? setSelectedToken : undefined}
          />
        }
        addButton={
          <AddButton
            disabled={isAddingFrame || isPending}
            onClick={() => setSizeDialogOpen(true)}
          />
        }
      />
      <ImageSizeDialog
        open={sizeDialogOpen}
        onOpenChange={setSizeDialogOpen}
        onConfirm={handleAddFrame}
      />
    </>
  );

  if (embedded) {
    return editorLayout;
  }

  const group = findResourceTypeGroup('texture');

  return (
    <LayoutShell
      flush
      titleBarProps={{
        title: resource.name,
        category: group ? t(group.title) : undefined,
        subtitle: resourceTypeMeta.texture.label,
      }}
    >
      {editorLayout}
    </LayoutShell>
  );
}
