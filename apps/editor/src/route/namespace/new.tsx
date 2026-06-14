import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { NamespacePostParams } from '@sharedTypes/api/namespace';
import { NamespacePostParamsSchema } from '@schema/api/namespace/post';
import { LayoutShell } from '@editor/components/features/layout/layout-shell';
import { FormTemplete } from '@editor/components/features/form/form-templete';
import { fetchPostApi } from '@editor/lib/api/post';
import { NamespaceFields } from '@editor/forms/namespace';

export function NewNamespacePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const fields = NamespaceFields({ mode: 'create' });

  const defaultValues: NamespacePostParams = {
    id: '',
    displayName: '',
    description: '',
    isPrivate: false,
  };

  const onSubmit = async (values: NamespacePostParams) => {
    await fetchPostApi('/api/namespace', values);
    navigate(`/namespace/${values.id}`);
  };

  return (
    <LayoutShell titleBarProps={{ title: t('グループ作成') }}>
      <FormTemplete
        fieldGroups={fields}
        schema={NamespacePostParamsSchema}
        defaultValues={defaultValues}
        onSubmit={onSubmit}
      />
    </LayoutShell>
  );
}
