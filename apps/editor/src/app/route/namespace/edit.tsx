import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import type { NamespaceInput } from '@sharedTypes/database/collection';
import { NamespaceInputSchema } from '@schema/database/namespace';
import { useDocumentById } from '@editor/shared/api/hooks/by-id';
import { useUpdateDocument } from '@editor/shared/api/hooks/mutations';
import { NamespaceFields } from '@editor/features/namespace-form/namespace';
import { LayoutShell } from '@editor/app/layout/components/layout-shell';
import { FormTemplete } from '@editor/shared/form/components/form-templete';
import { FormSkeleton } from '@editor/shared/skeletons/form';

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
