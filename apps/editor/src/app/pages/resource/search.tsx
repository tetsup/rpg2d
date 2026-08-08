import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { FolderOpen, Sparkles } from 'lucide-react';
import { MenuCard } from '@base/components/form-control/menu-card';
import { resourceRepository } from '@editor/shared/repository/resource-repository';
import { CancelCard } from '@editor/shared/components/form-control/cancel-card';
import { SelectDialog } from '@editor/widget/dialog/select-dialog';
import { PageShell } from '@editor/widget/shell/page-shell';
import { ResourceItem } from '@editor/feature/resource/resource-item';

export function ResourceSearchPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { type } = useParams<{ type: string }>();
  if (!type) throw new Error('type is needed');

  return (
    <PageShell
      titleBarProps={{
        title: t(type),
      }}
    >
      <CancelCard />
      <MenuCard
        onClick={() => navigate(`/resources/${type}/new`)}
        icon={Sparkles}
        title={t('新規作成')}
        description={`${t(type)}${t('を新しく作る')}`}
      />
      <MenuCard
        onClick={() => setDialogOpen(true)}
        icon={FolderOpen}
        title={t('開く')}
        description={`${t(type)}${t('を開いて編集')}`}
      />
      <SelectDialog
        title={`${t(type)}選択`}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onCommit={(id) => navigate(`/resources/${id}`)}
        renderItem={(id) => <ResourceItem id={id} />}
        mergeQuery={(q) => [
          { name: 'q', value: q },
          { name: 'type', op: 'eq', value: type },
        ]}
        useInfiniteSearch={resourceRepository.useInfiniteSearch}
      />
    </PageShell>
  );
}
