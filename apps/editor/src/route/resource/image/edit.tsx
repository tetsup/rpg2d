import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { ImageEditor } from '@editor/components/features/grid-editor/image-editor';
import { LayoutShell } from '@editor/components/features/layout/layout-shell';
import { useDocumentById } from '@editor/hooks/api/by-id';
import { FormSkeleton } from '@editor/components/skeletons/form';

export function EditImagePage() {
  const { t } = useTranslation();
  const { namespace, name } = useParams<{ namespace: string; name: string }>();
  if (namespace == null || name == null) throw new Error('bad request');
  const { data, isSuccess } = useDocumentById('resources', `${namespace}/image/${name}`);

  return (
    <LayoutShell flush titleBarProps={{ title: t('イメージ編集') }}>
      {isSuccess ? (
        <ImageEditor defaultValues={data} defaultPath={{ namespace, type: 'image', name }} />
      ) : (
        <FormSkeleton />
      )}
    </LayoutShell>
  );
}
