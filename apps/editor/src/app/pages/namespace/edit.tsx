import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import type { NamespaceInput } from '@sharedTypes/database/collection';
import { FormSkeleton } from '@base/components/form-field/form-skeleton';
import { namespaceRepository } from '@editor/shared/repository/namespace-repository';
import { PageShell } from '@editor/widget/shell/page-shell';
import { NamespaceForm } from './namespace-form';

export function EditNamespacePage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  if (!id) throw new Error('invalid id');
  const { data, isLoading } = namespaceRepository.useById(id);
  const update = namespaceRepository.update;

  const onSubmit = async (values: NamespaceInput) => {
    await update(id, values);
  };

  return (
    <PageShell titleBarProps={{ title: t('グループ編集') }}>
      {!isLoading && data ? <NamespaceForm defaultValues={data} onSubmit={onSubmit} /> : <FormSkeleton />}
    </PageShell>
  );
}
