import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import type { NamespaceInput } from '@sharedTypes/database/collection';
import { NamespaceInputSchema } from '@schema/database/namespace';
import { LayoutShell } from '@editor/components/features/layout/layout-shell';
import { FormTemplete } from '@editor/components/features/form/form-templete';
import { FormSkeleton } from '@editor/components/skeletons/form';
import { NamespaceFields } from '@editor/forms/namespace';
import { useDocumentById } from '@editor/hooks/api/by-id';
import { useUpdateDocument } from '@editor/hooks/api/mutations';

export function EditNamespacePage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useDocumentById('namespaces', id);
  const { mutateAsync: updateNamespace } = useUpdateDocument('namespaces');
  const fields = NamespaceFields({ mode: 'update' });

  const onSubmit = async (values: NamespaceInput) => {
    await updateNamespace({ id: id!, body: values });
  };

  return (
    <LayoutShell titleBarProps={{ title: t('グループ編集') }}>
      {!isLoading && data ? (
        <FormTemplete fieldGroups={fields} schema={NamespaceInputSchema} defaultValues={data} onSubmit={onSubmit} />
      ) : (
        <FormSkeleton />
      )}
    </LayoutShell>
  );
}
