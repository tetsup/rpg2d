import { useTranslation } from 'react-i18next';
import { Navigate, useParams } from 'react-router-dom';
import { formatResourceId } from '@schema/resource/common/base';
import type { ResourceInput } from '@sharedTypes/database/collection';
import { LayoutShell } from '@editor/components/features/layout/layout-shell';
import { FormTemplete } from '@editor/components/features/form/form-templete';
import { FormSkeleton } from '@editor/components/skeletons/form';
import { TileForm, tileInputSchema } from '@editor/forms/tile';
import { useDocumentById } from '@editor/hooks/api/by-id';
import { useUpdateDocument } from '@editor/hooks/api/mutations';
import { findResourceTypeGroup, resourceTypeMeta } from '@editor/lib/resource-type-meta';

export function EditTilePage() {
  const { t } = useTranslation();
  const { namespace, name } = useParams<{ namespace: string; name: string }>();
  const resourceId = namespace != null && name != null ? formatResourceId({ namespace, type: 'tile', name }) : undefined;
  const { data, isLoading, isError } = useDocumentById('resources', resourceId);
  const { mutateAsync: updateResource } = useUpdateDocument('resources');
  const fields = TileForm({ mode: 'update' });

  const meta = resourceTypeMeta.tile;
  const group = findResourceTypeGroup('tile');

  if (namespace == null || name == null) {
    return <Navigate to="/resources/tile" replace />;
  }

  const onSubmit = async (values: ResourceInput<'tile'>) => {
    await updateResource({ id: resourceId!, body: values });
  };

  return (
    <LayoutShell
      titleBarProps={{
        title: `${t(meta.label)}${t('を編集')}`,
        category: group ? t(group.title) : undefined,
      }}
    >
      {!isLoading && !isError && data?.type === 'tile' ? (
        <FormTemplete fieldGroups={fields} schema={tileInputSchema} defaultValues={data} onSubmit={onSubmit} withDraftToggle />
      ) : isLoading ? (
        <FormSkeleton />
      ) : (
        <Navigate to="/resources/tile" replace />
      )}
    </LayoutShell>
  );
}
