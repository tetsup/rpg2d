import { useTranslation } from 'react-i18next';
import { Navigate, useParams } from 'react-router-dom';
import { ImageGraphicsEditor } from '@editor/components/features/graphics/image-graphics-editor';
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
  const isValidRoute =
    namespace != null && type != null && name != null && isGraphicsResourceType(type);
  const resourceId = isValidRoute ? buildResourceId({ namespace, type, name }) : undefined;
  const { data: resource, isLoading, isError } = useDocumentById('resources', resourceId);

  if (!isValidRoute) {
    return <Navigate to="/resources" replace />;
  }

  if (isLoading) {
    return null;
  }

  if (isError || resource == null || resource.type !== type) {
    return <Navigate to="/resources" replace />;
  }

  if (resource.type === 'image') {
    return <ImageGraphicsEditor resource={resource} />;
  }

  const switcherLabel = getSwitcherLabel(type, t);

  return (
    <GraphicsResourceEditorShell
      type={type}
      title={resource.name}
      emptyLabel={t('表示する画像がありません')}
      switcherLabel={switcherLabel}
    />
  );
}
