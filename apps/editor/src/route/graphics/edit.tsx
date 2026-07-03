import { Navigate, useParams } from 'react-router-dom';
import { GraphicsEditor } from '@editor/components/features/graphics/graphics-editor';
import { formatResourceId } from '@schema/resource/common/base';
import { useDocumentById } from '@editor/hooks/api/by-id';
import { isGraphicsResourceType } from '@editor/lib/resource-type-meta';

export function EditGraphicsResourcePage() {
  const { namespace, type, name } = useParams<{ namespace: string; type: string; name: string }>();
  const isValidRoute =
    namespace != null && type != null && name != null && isGraphicsResourceType(type);
  const resourceId = isValidRoute ? formatResourceId({ namespace, type, name }) : undefined;
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

  if (resource.type === 'image' || resource.type === 'texture' || resource.type === 'skin') {
    return <GraphicsEditor resource={resource} />;
  }

  return <Navigate to="/resources" replace />;
}
