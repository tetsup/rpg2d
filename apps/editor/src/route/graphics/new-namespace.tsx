import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { LayoutShell } from '@editor/components/features/layout/layout-shell';
import { CancelCard } from '@editor/components/parts/cancel-card';
import { SelectDocument } from '@editor/components/parts/select-document';
import {
  findResourceTypeGroup,
  isGraphicsResourceType,
  resourceTypeMeta,
} from '@editor/lib/resource-type-meta';

export function NewGraphicsResourceNamespacePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { type } = useParams<{ type: string }>();

  if (type == null || !isGraphicsResourceType(type)) {
    return <Navigate to="/resources" replace />;
  }

  const meta = resourceTypeMeta[type];
  const group = findResourceTypeGroup(type);

  return (
    <LayoutShell
      titleBarProps={{
        title: t('{{label}}を作成', { label: meta.label }),
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
