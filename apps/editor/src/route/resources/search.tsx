import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { LayoutShell } from '@editor/components/features/layout/layout-shell';
import { CancelCard } from '@editor/components/parts/cancel-card';
import { SelectDocument } from '@editor/components/parts/select-document';
import { findResourceTypeGroup, isBrowsableResourceType, resourceTypeMeta } from '@editor/lib/resource-type-meta';

export function ResourceSearchPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { type } = useParams<{ type: string }>();

  if (type == null || !isBrowsableResourceType(type)) {
    return <Navigate to="/resources" replace />;
  }

  const meta = resourceTypeMeta[type];
  const group = findResourceTypeGroup(type);

  return (
    <LayoutShell
      titleBarProps={{
        title: t(meta.label),
        category: group ? t(group.title) : undefined,
      }}
    >
      <CancelCard />
      <SelectDocument
        collectionName="resources"
        resourceType={type}
        onItemSelect={(item) => navigate(`/resource/${item.id}`)}
      />
    </LayoutShell>
  );
}
