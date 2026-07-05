import { useTranslation } from 'react-i18next';
import { LayoutShell } from '@editor/components/features/layout/layout-shell';
import { FormTemplete } from '@editor/components/features/form/form-templete';
import {
  createManifestDefaultValues,
  ManifestForm,
  manifestInputSchema,
} from '@editor/forms/manifest';
import { ResourceInput } from '@sharedTypes/database/collection';
import { useNavigate } from 'react-router-dom';
import { useCreateDocument } from '@editor/hooks/api/mutations';
import { formatResourceId } from '@schema/resource/common/base';
import { useWorkspaceStore } from '@editor/stores/workspace';

export function NewManifestPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setWorkspace = useWorkspaceStore((s) => s.setCurrent);
  const { mutateAsync: createResource } = useCreateDocument('resources');
  const fields = ManifestForm({ mode: 'create' });

  const defaultValues: ResourceInput<'manifest'> = createManifestDefaultValues();

  const onSubmit = async (values: ResourceInput<'manifest'>) => {
    await createResource(values);
    const manifestId = formatResourceId(values);
    setWorkspace({ manifestId });
    navigate('/');
  };
  return (
    <LayoutShell titleBarProps={{ title: t('プロジェクト設定') }}>
      <FormTemplete
        fieldGroups={fields}
        schema={manifestInputSchema}
        defaultValues={defaultValues}
        onSubmit={onSubmit}
        withDraftToggle
      />
    </LayoutShell>
  );
}
