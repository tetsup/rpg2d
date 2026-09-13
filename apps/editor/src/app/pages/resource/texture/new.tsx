import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ResourceInput } from '@sharedTypes/database/collection';
import { resourceRepository } from '@editor/shared/repository/resource-repository';
import { PageShell } from '@editor/widget/shell/page-shell';
import { useResource } from '@editor/factory/resource';
import { TextureForm } from './texture-form';

export function NewTexturePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const defaultValues = useResource({ type: 'texture' });
  const onSubmit = async (values: ResourceInput<'texture'>) => {
    await resourceRepository.create(values);
    navigate('/');
  };

  return (
    <PageShell titleBarProps={{ title: t('プロジェクト作成') }}>
      <TextureForm defaultValues={defaultValues} onSubmit={onSubmit} />
    </PageShell>
  );
}
