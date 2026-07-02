import { useTranslation } from 'react-i18next';
import { LayoutShell } from '@editor/components/features/layout/layout-shell';
import { FormTemplete } from '@editor/components/features/form/form-templete';
import {
  createManifestCreateDefaultValues,
  ManifestForm,
  manifestInputSchema,
} from '@editor/forms/manifest';
import { ResourceInput } from '@sharedTypes/database/collection';
import { useNavigate } from 'react-router-dom';
import { useCreateDocument } from '@editor/hooks/api/mutations';
import { buildResourceId } from '@editor/hooks/api/resource-id';

export function NewManifestPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { mutateAsync: createResource } = useCreateDocument('resources');
  const fields = ManifestForm({ mode: 'create' });

  const defaultValues: ResourceInput<'manifest'> = createManifestCreateDefaultValues();

  const onSubmit = async (values: ResourceInput<'manifest'>) => {
    await createResource(values);
    navigate(`/resource/${buildResourceId(values)}`);
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
