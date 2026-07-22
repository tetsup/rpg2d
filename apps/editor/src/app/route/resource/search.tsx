import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { parseResourceId } from '@schema/resource/common/base';
import {
  findResourceTypeGroup,
  isBrowsableResourceType,
  isCreatableResourceType,
  resourceTypeMeta,
} from '@editor/shared/lib/resource-type-meta';
import { LayoutShell } from '@editor/app/layout/components/layout-shell';
import { CancelCard } from '@editor/shared/parts/cancel-card';
import { MenuCard } from '@editor/shared/parts/menu-card';
import { SelectDocument } from '@editor/shared/parts/select-document';

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
      {isCreatableResourceType(type) && (
        <MenuCard
          onClick={() => navigate(`/resources/${type}/new`)}
          icon={Sparkles}
          title={t('新規作成')}
          description={`${t(meta.label)}${t('を新しく作る')}`}
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
