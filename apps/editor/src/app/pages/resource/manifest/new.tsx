import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ResourceInput } from '@sharedTypes/database/collection';
import { formatResourceId } from '@schema/resource/common/base';
import { useWorkspaceStore } from '@editor/stores/workspace';
import { resourceRepository } from '@editor/shared/repository/resource-repository';
import { PageShell } from '@editor/widget/shell/page-shell';
import { buildResource } from '@editor/factory/resource';
import { ManifestForm } from './manifest-form';

export function NewManifestPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setWorkspace = useWorkspaceStore((s) => s.setCurrent);
  const defaultValues = buildResource({ type: 'manifest' });
  const onSubmit = async (values: ResourceInput<'manifest'>) => {
    await resourceRepository.create(values);
    const manifestId = formatResourceId(values);
    setWorkspace({ manifestId });
    navigate('/');
  };

  return (
    <PageShell titleBarProps={{ title: t('プロジェクト設定') }}>
      <ManifestForm defaultValues={defaultValues} onSubmit={onSubmit} />
    </PageShell>
  );
}
