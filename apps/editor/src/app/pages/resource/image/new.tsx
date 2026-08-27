import { useTranslation } from 'react-i18next';
import { ResourceInput } from '@sharedTypes/database/collection';
import { resourceRepository } from '@editor/shared/repository/resource-repository';
import { useResource } from '@editor/factory/resource';
import { PageShell } from '@editor/widget/shell/page-shell';
import { ImagePage } from './image-page';

export function NewImagePage() {
  const { t } = useTranslation();
  const defaultValues = useResource({ type: 'image' });
  const onSubmit = async (data: ResourceInput<'image'>) => {
    await resourceRepository.create(data);
  };

  return (
    <PageShell flush titleBarProps={{ title: t('イメージ編集') }}>
      <ImagePage defaultValues={defaultValues} onSubmit={onSubmit} />
    </PageShell>
  );
}
