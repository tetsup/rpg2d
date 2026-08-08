import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import type { NamespaceInput } from '@sharedTypes/database/collection';
import { namespaceRepository } from '@editor/shared/repository/namespace-repository';
import { PageShell } from '@editor/widget/shell/page-shell';
import { NamespaceForm } from './namespace-form';

export function NewNamespacePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const defaultValues: NamespaceInput = {
    id: '',
    presenceName: '',
    description: '',
    isPrivate: false,
  };

  const onSubmit = async (values: NamespaceInput) => {
    await namespaceRepository.create(values);
    navigate(`/namespaces/${values.id}`);
  };

  return (
    <PageShell titleBarProps={{ title: t('グループ作成') }}>
      <NamespaceForm defaultValues={defaultValues} onSubmit={onSubmit} />
    </PageShell>
  );
}
