import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { createResourceInputSchema } from '@schema/database/resource';
import type { ResourceRecord } from '@sharedTypes/database/collection';
import { AddButton } from '@editor/components/features/graphics/add-button';
import { GraphicsContextList } from '@editor/components/features/graphics/graphics-context-list';
import { GraphicsEditorLayout } from '@editor/components/features/graphics/graphics-editor-layout';
import { GraphicsSaveBar } from '@editor/components/features/graphics/graphics-save-bar';
import { PixelCanvas } from '@editor/components/features/graphics/pixel-canvas';
import { SwitcherPopup } from '@editor/components/features/graphics/switcher-popup';
import { TextureGraphicsEditorBody } from '@editor/components/features/graphics/texture-graphics-editor';
import { LayoutShell } from '@editor/components/features/layout/layout-shell';
import { createEmptyTextureData } from '@editor/lib/empty-texture-data';
import { findResourceTypeGroup, resourceTypeMeta } from '@editor/lib/resource-type-meta';
import { reserveGraphicsResourceDraft } from '@editor/lib/reserve-graphics-resource';
import {
  SKIN_DIRECTION_LABELS,
  SKIN_DIRECTIONS,
  type SkinDirection,
} from '@editor/lib/skin-directions';
import { useUpdateDocument } from '@editor/hooks/api/mutations';
import { useDocumentById } from '@editor/hooks/api/by-id';
import { useLayoutStore } from '@editor/stores/edit-state';

type SkinGraphicsEditorProps = {
  resource: ResourceRecord<'skin'>;
};

export function SkinGraphicsEditor({ resource }: SkinGraphicsEditorProps) {
  return <SkinGraphicsEditorBody key={resource.id} resource={resource} />;
}

function SkinGraphicsEditorBody({ resource }: SkinGraphicsEditorProps) {
  const { t } = useTranslation();
  const { mutateAsync: updateResource, isPending } = useUpdateDocument('resources');
  const setEditState = useLayoutStore((state) => state.setEditState);
  const isEditorDirty = useLayoutStore((state) => state.editState.isDirty);

  const [draftSkin, setDraftSkin] = useState(resource.data);
  const [isDraft, setIsDraft] = useState(resource.isDraft);
  const [activeDirection, setActiveDirection] = useState<SkinDirection>('down');
  const [isAddingTexture, setIsAddingTexture] = useState(false);

  const activeTextureId = draftSkin.textures[activeDirection];
  const { data: activeTexture } = useDocumentById('resources', activeTextureId ?? undefined);

  const skinDirty = useMemo(() => {
    return isDraft !== resource.isDraft || JSON.stringify(draftSkin) !== JSON.stringify(resource.data);
  }, [draftSkin, isDraft, resource.data, resource.isDraft]);

  const skinValidation = useMemo(() => {
    return createResourceInputSchema('skin').safeParse({
      namespace: resource.namespace,
      type: 'skin',
      name: resource.name,
      version: resource.version,
      description: resource.description,
      isDraft,
      data: draftSkin,
    });
  }, [draftSkin, isDraft, resource.description, resource.name, resource.namespace, resource.version]);

  useEffect(() => {
    if (activeTexture?.type === 'texture') return;
    setEditState({ isDirty: skinDirty });
    return () => setEditState({});
  }, [activeTexture?.type, setEditState, skinDirty]);

  const handleSaveSkin = async () => {
    if (!skinValidation.success) return;

    try {
      await updateResource({ id: resource.id, body: skinValidation.data });
      toast.success(t('保存しました'));
    } catch (error) {
      console.error(error);
      toast.error(`${t('保存に失敗しました')}: ${(error as Error).message}`);
    }
  };

  const handleSelectDirection = (direction: SkinDirection) => {
    if (direction === activeDirection) return;
    if (skinDirty || isEditorDirty) {
      toast.error(t('方向を切り替える前に保存してください'));
      return;
    }
    setActiveDirection(direction);
  };

  const handleAddTexture = async () => {
    setIsAddingTexture(true);
    try {
      const { id } = await reserveGraphicsResourceDraft({
        namespace: resource.namespace,
        type: 'texture',
        parent: resource.name,
        hint: activeDirection,
        data: createEmptyTextureData(),
      });

      setDraftSkin((current) => ({
        textures: { ...current.textures, [activeDirection]: id },
      }));
      toast.success(t('テクスチャを追加しました'));
    } catch (error) {
      console.error(error);
      toast.error(`${t('作成に失敗しました')}: ${(error as Error).message}`);
    } finally {
      setIsAddingTexture(false);
    }
  };

  const directionItems = SKIN_DIRECTIONS.map((direction) => ({
    id: direction,
    label: t(SKIN_DIRECTION_LABELS[direction]),
    onSelect: () => handleSelectDirection(direction),
  }));

  const group = findResourceTypeGroup('skin');

  return (
    <LayoutShell
      flush
      titleBarProps={{
        title: resource.name,
        category: group ? t(group.title) : undefined,
        subtitle: resourceTypeMeta.skin.label,
      }}
    >
      <div className="flex h-full min-h-0 flex-col">
        {skinDirty && (
          <div className="shrink-0 border-b border-border">
            <GraphicsSaveBar
              isDraft={isDraft}
              onDraftChange={setIsDraft}
              isDirty={skinDirty}
              isValid={skinValidation.success}
              isSaving={isPending}
              onSave={handleSaveSkin}
            />
          </div>
        )}

        <div className="min-h-0 flex-1">
          {activeTexture?.type === 'texture' ? (
            <TextureGraphicsEditorBody resource={activeTexture} embedded />
          ) : (
            <GraphicsEditorLayout
              canvas={
                <PixelCanvas
                  className="w-full"
                  emptyLabel={t('＋ボタンからテクスチャを追加してください')}
                />
              }
              switcher={
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
              }
              addButton={
                <AddButton disabled={isAddingTexture || isPending} onClick={handleAddTexture} />
              }
            />
          )}
        </div>

        {activeTexture?.type === 'texture' && (
          <footer className="shrink-0 border-t border-border bg-background p-2">
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
          </footer>
        )}
      </div>
    </LayoutShell>
  );
}
