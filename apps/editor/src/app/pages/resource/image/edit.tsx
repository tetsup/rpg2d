import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { FormSkeleton } from '@base/components/form-field/form-skeleton';
import { resourceRepository } from '@editor/shared/repository/resource-repository';
import { PageShell } from '@editor/widget/shell/page-shell';
import { ImageEditor } from '@editor/feature/image/image-editor';

export function EditImagePage() {
  const { t } = useTranslation();
  const { namespace, name } = useParams<{ namespace: string; name: string }>();
  if (namespace == null || name == null) throw new Error('bad request');
  const { data, isSuccess } = resourceRepository.useById(`${namespace}/image/${name}`);

  return (
    <PageShell flush titleBarProps={{ title: t('イメージ編集') }}>
      {isSuccess ? (
        <ImageEditor defaultValues={data} defaultPath={{ namespace, type: 'image', name }} />
      ) : (
        <FormSkeleton />
      )}
    </PageShell>
  );
}
