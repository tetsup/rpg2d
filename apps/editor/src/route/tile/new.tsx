import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { formatResourceId } from '@schema/resource/common/base';
import type { ResourceInput } from '@sharedTypes/database/collection';
import { LayoutShell } from '@editor/components/features/layout/layout-shell';
import { FormTemplete } from '@editor/components/features/form/form-templete';
import { createTileDefaultValues, TileForm, tileInputSchema } from '@editor/forms/tile';
import { useCreateDocument } from '@editor/hooks/api/mutations';
import { findResourceTypeGroup, resourceTypeMeta } from '@editor/lib/resource-type-meta';

export function NewTilePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { namespace } = useParams<{ namespace: string }>();
  const { mutateAsync: createResource } = useCreateDocument('resources');
  const fields = TileForm({ mode: 'create' });

  if (namespace == null) {
    return <Navigate to="/resources/tile/new" replace />;
  }

  const meta = resourceTypeMeta.tile;
  const group = findResourceTypeGroup('tile');

  const defaultValues: ResourceInput<'tile'> = createTileDefaultValues(namespace);

  const onSubmit = async (values: ResourceInput<'tile'>) => {
    await createResource(values);
    navigate(`/resources/${formatResourceId(values)}`);
  };

  return (
    <LayoutShell
      titleBarProps={{
        title: `${t(meta.label)}${t('を作成')}`,
        category: group ? t(group.title) : undefined,
      }}
    >
      <FormTemplete
        fieldGroups={fields}
        schema={tileInputSchema}
        defaultValues={defaultValues}
        onSubmit={onSubmit}
        withDraftToggle
      />
    </LayoutShell>
  );
}
