import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { createResourceInputSchema } from '@schema/database/resource';
import type { ResourceRecord } from '@sharedTypes/database/collection';
import { AddButton } from '@editor/components/features/graphics/add-button';
import { GraphicsEditorLayout } from '@editor/components/features/graphics/graphics-editor-layout';
import { GraphicsSaveBar } from '@editor/components/features/graphics/graphics-save-bar';
import { PalettePanel } from '@editor/components/features/graphics/palette-panel';
import { PixelCanvas } from '@editor/components/features/graphics/pixel-canvas';
import { SwitcherPopup } from '@editor/components/features/graphics/switcher-popup';
import { ToolBar } from '@editor/components/features/graphics/toolbar';
import { LayoutShell } from '@editor/components/features/layout/layout-shell';
import { getDefaultPaletteToken, setImagePixel } from '@editor/lib/image-pixel-mutate';
import { findResourceTypeGroup, resourceTypeMeta } from '@editor/lib/resource-type-meta';
import { useUpdateDocument } from '@editor/hooks/api/mutations';
import { useLayoutStore } from '@editor/stores/edit-state';

type ImageGraphicsEditorProps = {
  resource: ResourceRecord<'image'>;
};

export function ImageGraphicsEditor({ resource }: ImageGraphicsEditorProps) {
  return <ImageGraphicsEditorBody key={resource.id} resource={resource} />;
}

function ImageGraphicsEditorBody({ resource }: ImageGraphicsEditorProps) {
  const { t } = useTranslation();
  const { mutateAsync: updateResource, isPending } = useUpdateDocument('resources');
  const setEditState = useLayoutStore((state) => state.setEditState);

  const [draftData, setDraftData] = useState(resource.data);
  const [isDraft, setIsDraft] = useState(resource.isDraft);
  const [selectedToken, setSelectedToken] = useState(() => getDefaultPaletteToken(resource.data.palette));

  const isDirty = useMemo(() => {
    return isDraft !== resource.isDraft || JSON.stringify(draftData) !== JSON.stringify(resource.data);
  }, [draftData, isDraft, resource.data, resource.isDraft]);

  const validation = useMemo(() => {
    return createResourceInputSchema('image').safeParse({
      namespace: resource.namespace,
      type: 'image',
      name: resource.name,
      version: resource.version,
      description: resource.description,
      isDraft,
      data: draftData,
    });
  }, [draftData, isDraft, resource.description, resource.name, resource.namespace, resource.version]);

  useEffect(() => {
    setEditState({ isDirty });
    return () => setEditState({});
  }, [isDirty, setEditState]);

  const handleSave = async () => {
    if (!validation.success) return;

    try {
      await updateResource({
        id: resource.id,
        body: validation.data,
      });
      setDraftData(validation.data.data);
      setIsDraft(validation.data.isDraft);
      setSelectedToken(getDefaultPaletteToken(validation.data.data.palette));
      toast.success(t('保存しました'));
    } catch (error) {
      console.error(error);
      toast.error(`${t('保存に失敗しました')}: ${(error as Error).message}`);
    }
  };

  const group = findResourceTypeGroup('image');

  return (
    <LayoutShell
      flush
      titleBarProps={{
        title: resource.name,
        category: group ? t(group.title) : undefined,
        subtitle: resourceTypeMeta.image.label,
      }}
    >
      <GraphicsEditorLayout
        canvas={
          <PixelCanvas
            className="w-full"
            image={draftData}
            activeToken={selectedToken}
            onPaint={(x, y) => {
              setDraftData((current) => setImagePixel(current, x, y, selectedToken));
            }}
          />
        }
        saveBar={
          <GraphicsSaveBar
            isDraft={isDraft}
            onDraftChange={setIsDraft}
            isDirty={isDirty}
            isValid={validation.success}
            isSaving={isPending}
            onSave={handleSave}
          />
        }
        switcher={
          <SwitcherPopup
            label={t('画像')}
            description={t('画像を切り替えます')}
            disabled
          />
        }
        toolbar={<ToolBar />}
        palette={
          <PalettePanel
            palette={draftData.palette}
            selectedToken={selectedToken}
            onSelectToken={setSelectedToken}
          />
        }
        addButton={<AddButton disabled />}
      />
    </LayoutShell>
  );
}
