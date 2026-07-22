import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ResourceInput } from '@sharedTypes/database/collection';
import { formatResourceId } from '@schema/resource/common/base';
import { useWorkspaceStore } from '@editor/app/stores/workspace';
import { useCreateDocument } from '@editor/shared/api/hooks/mutations';
import {
  createManifestDefaultValues,
  ManifestForm,
  manifestInputSchema,
} from '@editor/features/manifest-form/manifest';
import { LayoutShell } from '@editor/app/layout/components/layout-shell';
import { FormTemplete } from '@editor/shared/form/components/form-templete';

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
