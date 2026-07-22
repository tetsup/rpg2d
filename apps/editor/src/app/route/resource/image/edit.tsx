import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { LayoutShell } from '@editor/app/layout/components/layout-shell';
import { ImageEditor } from '@editor/features/grid-editor/components/image-editor';
import { useDocumentById } from '@editor/shared/api/hooks/by-id';
import { FormSkeleton } from '@editor/shared/skeletons/form';

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
