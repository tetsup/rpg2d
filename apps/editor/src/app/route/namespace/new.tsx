import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { NamespaceInput } from '@sharedTypes/database/collection';
import { NamespaceInputSchema } from '@schema/database/namespace';
import { useCreateDocument } from '@editor/shared/api/hooks/mutations';
import { NamespaceFields } from '@editor/features/namespace-form/namespace';
import { LayoutShell } from '@editor/app/layout/components/layout-shell';
import { FormTemplete } from '@editor/shared/form/components/form-templete';

export function NewNamespacePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { mutateAsync: createNamespace } = useCreateDocument('namespaces');
  const fields = NamespaceFields({ mode: 'create' });

  const defaultValues: NamespaceInput = {
    id: '',
    presenceName: '',
    description: '',
    isPrivate: false,
  };

  const onSubmit = async (values: NamespaceInput) => {
    await createNamespace(values);
    navigate(`/namespaces/${values.id}`);
  };

  return (
    <LayoutShell titleBarProps={{ title: t('グループ作成') }}>
      <FormTemplete
        fieldGroups={fields}
        schema={NamespaceInputSchema}
        defaultValues={defaultValues}
        onSubmit={onSubmit}
      />
    </LayoutShell>
  );
}
