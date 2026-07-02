import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { NamespaceInput } from '@sharedTypes/database/collection';
import { NamespaceInputSchema } from '@schema/database/namespace';
import { LayoutShell } from '@editor/components/features/layout/layout-shell';
import { FormTemplete } from '@editor/components/features/form/form-templete';
import { NamespaceFields } from '@editor/forms/namespace';
import { useCreateDocument } from '@editor/hooks/api/mutations';

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
