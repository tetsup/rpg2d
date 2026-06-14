import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import type { NamespaceInput } from '@sharedTypes/database/collection';
import { NamespaceInputSchema } from '@schema/database/namespace';
import { LayoutShell } from '@editor/components/features/layout/layout-shell';
import { FormTemplete } from '@editor/components/features/form/form-templete';
import { FormSkeleton } from '@editor/components/skeletons/form';
import { NamespaceFields } from '@editor/forms/namespace';
import { fetchGetApi } from '@editor/lib/api/get';
import { fetchPutApi } from '@editor/lib/api/put';

export function EditNamespacePage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useQuery({
    queryKey: ['namespace', id],
    queryFn: () => fetchGetApi(`/api/namespace/${id}`),
  });
  const fields = NamespaceFields({ mode: 'update' });

  const onSubmit = async (values: NamespaceInput) => {
    await fetchPutApi(`/api/namespace/${id}`, values);
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
