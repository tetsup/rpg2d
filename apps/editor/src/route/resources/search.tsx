import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { LayoutShell } from '@editor/components/features/layout/layout-shell';
import { CancelCard } from '@editor/components/parts/cancel-card';
import { SelectDocument } from '@editor/components/parts/select-document';
import { MenuCard } from '@editor/components/parts/menu-card';
import { Sparkles } from 'lucide-react';
import { parseResourceId } from '@schema/resource/common/base';
import {
  findResourceTypeGroup,
  isBrowsableResourceType,
  isGraphicsResourceType,
  resourceTypeMeta,
} from '@editor/lib/resource-type-meta';

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
      {isGraphicsResourceType(type) && (
        <MenuCard
          onClick={() => navigate(`/resources/${type}/new`)}
          icon={Sparkles}
          title={t('新規作成')}
          description={t('{{label}}を新しく作る', { label: t(meta.label) })}
        />
      )}
      <SelectDocument
        collectionName="resources"
        resourceType={type}
        onItemSelect={(item) => {
          const { namespace, type: resourceType, name } = parseResourceId.parse(item.id);
          navigate(`/resources/${namespace}/${resourceType}/${name}`);
        }}
      />
    </LayoutShell>
  );
}
