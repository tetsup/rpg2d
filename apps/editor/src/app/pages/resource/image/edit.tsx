import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { ResourceInput } from '@sharedTypes/database/collection';
import { FormSkeleton } from '@base/components/form-field/form-skeleton';
import { resourceRepository } from '@editor/shared/repository/resource-repository';
import { PageShell } from '@editor/widget/shell/page-shell';
import { ImagePage } from './image-page';

export function EditImagePage() {
  const { t } = useTranslation();
  const { namespace, name } = useParams<{ namespace: string; name: string }>();
  if (namespace == null || name == null) throw new Error('bad request');
  const resourceId = `${namespace}/image/${name}`;
  const { data: defaultValues, isSuccess } = resourceRepository.useById(resourceId);
  const onSubmit = async (data: ResourceInput<'image'>) => {
    await resourceRepository.update(resourceId, data);
  };

  return (
    <PageShell flush titleBarProps={{ title: t('イメージ編集') }}>
      {isSuccess ? <ImagePage defaultValues={defaultValues} onSubmit={onSubmit} /> : <FormSkeleton />}
    </PageShell>
  );
}
