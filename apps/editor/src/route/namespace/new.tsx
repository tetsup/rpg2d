import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { NamespaceInput } from '@sharedTypes/database/collection';
import { NamespaceInputSchema } from '@schema/database/namespace';
import { LayoutShell } from '@editor/components/features/layout/layout-shell';
import { FormTemplete } from '@editor/components/features/form/form-templete';
import { fetchPostApi } from '@editor/lib/api/post';
import { NamespaceFields } from '@editor/forms/namespace';

export function NewNamespacePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const fields = NamespaceFields({ mode: 'create' });

  const defaultValues: NamespaceInput = {
    id: '',
    presenceName: '',
    description: '',
    isPrivate: false,
  };

  const onSubmit = async (values: NamespaceInput) => {
    await fetchPostApi('/api/namespaces', values);
    navigate(`/namespace/${values.id}`);
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
