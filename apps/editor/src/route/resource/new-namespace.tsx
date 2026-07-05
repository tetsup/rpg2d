import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { LayoutShell } from '@editor/components/features/layout/layout-shell';
import { CancelCard } from '@editor/components/parts/cancel-card';
import { SelectDocument } from '@editor/components/parts/select-document';
import {
  findResourceTypeGroup,
  isCreatableResourceType,
  resourceTypeMeta,
} from '@editor/lib/resource-type-meta';

export function NewResourceNamespacePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { type } = useParams<{ type: string }>();

  if (type == null || !isCreatableResourceType(type)) {
    return <Navigate to="/resources" replace />;
  }

  const meta = resourceTypeMeta[type];
  const group = findResourceTypeGroup(type);

  return (
    <LayoutShell
      titleBarProps={{
        title: `${t(meta.label)}${t('を作成')}`,
        category: group ? t(group.title) : undefined,
      }}
    >
      <CancelCard />
      <p className="text-sm text-muted-foreground">{t('グループを選んでから編集を始めます')}</p>
      <SelectDocument
        collectionName="namespaces"
        onItemSelect={(namespace) => navigate(`/resources/${namespace.id}/${type}/new`)}
      />
    </LayoutShell>
  );
}
