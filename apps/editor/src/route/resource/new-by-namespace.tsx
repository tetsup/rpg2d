import { Navigate, useParams } from 'react-router-dom';
import { NewGraphicsResourcePage } from '@editor/route/graphics/new';
import { NewTilePage } from '@editor/route/tile/new';
import { isCreatableResourceType, isGraphicsResourceType } from '@editor/lib/resource-type-meta';

export function NewResourceByNamespacePage() {
  const { type } = useParams<{ type: string }>();

  if (type == null || !isCreatableResourceType(type)) {
    return <Navigate to="/resources" replace />;
  }

  if (isGraphicsResourceType(type)) {
    return <NewGraphicsResourcePage />;
  }

  if (type === 'tile') {
    return <NewTilePage />;
  }

  return <Navigate to="/resources" replace />;
}
