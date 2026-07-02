import { useTranslation } from 'react-i18next';
import { Navigate, useParams } from 'react-router-dom';
import { AddButton } from '@editor/components/features/graphics/add-button';
import {
  getSwitcherLabel,
  GraphicsResourceEditorShell,
} from '@editor/components/features/graphics/graphics-resource-editor-shell';
import { buildResourceId } from '@editor/hooks/api/resource-id';
import { useDocumentById } from '@editor/hooks/api/by-id';
import { isGraphicsResourceType } from '@editor/lib/resource-type-meta';

export function EditGraphicsResourcePage() {
  const { t } = useTranslation();
  const { namespace, type, name } = useParams<{ namespace: string; type: string; name: string }>();

  if (namespace == null || type == null || name == null || !isGraphicsResourceType(type)) {
    return <Navigate to="/resources" replace />;
  }

  const resourceId = buildResourceId({ namespace, type, name });
  const { data: resource, isLoading, isError } = useDocumentById('resources', resourceId);

  if (isLoading) {
    return null;
  }

  if (isError || resource == null || resource.type !== type) {
    return <Navigate to="/resources" replace />;
  }

  const switcherLabel = getSwitcherLabel(type, t);

  if (resource.type === 'image') {
    return (
      <GraphicsResourceEditorShell
        type="image"
        title={resource.name}
        images={[resource.data]}
        palette={resource.data.palette}
        emptyLabel={t('画像データがありません')}
        switcherLabel={switcherLabel}
        switcherDisabled
        addButton={<AddButton disabled />}
      />
    );
  }

  return (
    <GraphicsResourceEditorShell
      type={type}
      title={resource.name}
      emptyLabel={t('表示する画像がありません')}
      switcherLabel={switcherLabel}
    />
  );
}
