import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@editor/components/ui/button';
import { GraphicsResourceEditorShell } from '@editor/components/features/graphics/graphics-resource-editor-shell';
import { GraphicsResourceNameDialog } from '@editor/components/features/graphics/graphics-resource-name-dialog';
import { ImageSizeDialog } from '@editor/components/features/graphics/image-size-dialog';
import { createEmptyImageData } from '@editor/lib/empty-image-data';
import { createEmptySkinData } from '@editor/lib/empty-skin-data';
import { createEmptyTextureData } from '@editor/lib/empty-texture-data';
import { reserveGraphicsResourceDraft } from '@editor/lib/reserve-graphics-resource';
import { isGraphicsResourceType, resourceTypeMeta } from '@editor/lib/resource-type-meta';

export function NewGraphicsResourcePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { namespace, type } = useParams<{ namespace: string; type: string }>();
  const [sizeDialogOpen, setSizeDialogOpen] = useState(false);
  const [nameDialogOpen, setNameDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  if (namespace == null || type == null || !isGraphicsResourceType(type)) {
    return <Navigate to="/resources" replace />;
  }

  const handleCreateImage = async (size: { width: number; height: number }) => {
    setIsCreating(true);
    try {
      const { name } = await reserveGraphicsResourceDraft({
        namespace,
        type: 'image',
        data: createEmptyImageData(size.width, size.height),
      });
      navigate(`/resources/${namespace}/image/${name}`);
    } catch (error) {
      console.error(error);
      toast.error(`${t('作成に失敗しました')}: ${(error as Error).message}`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateNamedResource = async (resourceName: string) => {
    setIsCreating(true);
    try {
      const data =
        type === 'skin' ? createEmptySkinData() : createEmptyTextureData();
      const { name } = await reserveGraphicsResourceDraft({
        namespace,
        type,
        hint: resourceName,
        data,
      });
      setNameDialogOpen(false);
      navigate(`/resources/${namespace}/${type}/${name}`);
    } catch (error) {
      console.error(error);
      toast.error(`${t('作成に失敗しました')}: ${(error as Error).message}`);
    } finally {
      setIsCreating(false);
    }
  };

  if (type === 'image') {
    return (
      <>
        <GraphicsResourceEditorShell
          type={type}
          title={t('画像を作成')}
          emptyLabel={t('サイズを指定して画像を作成してください')}
          emptyAction={
            <Button type="button" disabled={isCreating} onClick={() => setSizeDialogOpen(true)}>
              {t('サイズを指定して作成')}
            </Button>
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

  const meta = resourceTypeMeta[type];

  return (
    <>
      <GraphicsResourceEditorShell
        type={type}
        title={t('{{label}}を作成', { label: t(meta.label) })}
        emptyLabel={t('名前を入力して{{label}}を作成してください', { label: t(meta.label) })}
        emptyAction={
          <Button type="button" disabled={isCreating} onClick={() => setNameDialogOpen(true)}>
            {t('名前を指定して作成')}
          </Button>
        }
      />
      <GraphicsResourceNameDialog
        open={nameDialogOpen}
        onOpenChange={setNameDialogOpen}
        title={t('{{label}}を作成', { label: t(meta.label) })}
        description={t('リソース名を入力します（例: hero, hero.down）')}
        pending={isCreating}
        onConfirm={handleCreateNamedResource}
      />
    </>
  );
}
