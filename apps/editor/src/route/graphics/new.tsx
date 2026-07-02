import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { AddButton } from '@editor/components/features/graphics/add-button';
import {
  getSwitcherLabel,
  GraphicsResourceEditorShell,
} from '@editor/components/features/graphics/graphics-resource-editor-shell';
import { ImageSizeDialog } from '@editor/components/features/graphics/image-size-dialog';
import { createEmptyImageData } from '@editor/lib/empty-image-data';
import { generateGraphicsResourceName } from '@editor/lib/graphics-resource-name';
import { isGraphicsResourceType, resourceTypeMeta } from '@editor/lib/resource-type-meta';
import { useCreateDocument } from '@editor/hooks/api/mutations';

export function NewGraphicsResourcePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { namespace, type } = useParams<{ namespace: string; type: string }>();
  const [sizeDialogOpen, setSizeDialogOpen] = useState(false);
  const { mutateAsync: createResource, isPending } = useCreateDocument('resources');

  if (namespace == null || type == null || !isGraphicsResourceType(type)) {
    return <Navigate to="/resources" replace />;
  }

  const switcherLabel = getSwitcherLabel(type, t);

  const handleCreateImage = async (size: { width: number; height: number }) => {
    const name = generateGraphicsResourceName('image');

    try {
      await createResource({
        namespace,
        type: 'image',
        name,
        version: 0,
        isDraft: true,
        data: createEmptyImageData(size.width, size.height),
      });
      navigate(`/resources/${namespace}/image/${name}`);
    } catch (error) {
      console.error(error);
      toast.error(`${t('作成に失敗しました')}: ${(error as Error).message}`);
    }
  };

  if (type === 'image') {
    return (
      <>
        <GraphicsResourceEditorShell
          type={type}
          title={t('画像を作成')}
          emptyLabel={t('＋ボタンから画像を追加してください')}
          switcherLabel={switcherLabel}
          switcherDisabled
          addButton={
            <AddButton
              disabled={isPending}
              onClick={() => setSizeDialogOpen(true)}
            />
          }
        />
        <ImageSizeDialog
          open={sizeDialogOpen}
          onOpenChange={setSizeDialogOpen}
          onConfirm={handleCreateImage}
        />
      </>
    );
  }

  return (
    <GraphicsResourceEditorShell
      type={type}
      title={t('{{label}}を作成', { label: t(resourceTypeMeta[type].label) })}
      emptyLabel={t('＋ボタンから追加してください')}
      switcherLabel={switcherLabel}
      switcherDisabled
    />
  );
}
