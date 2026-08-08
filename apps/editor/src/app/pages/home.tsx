import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { FolderUp, Play, Settings2, Sparkles } from 'lucide-react';
import { FormSection } from '@base/components/form-field/form-section';
import { MenuCard } from '@base/components/form-control/menu-card';
import { resourceRepository } from '@editor/shared/repository/resource-repository';
import { SelectDialog } from '@editor/widget/dialog/select-dialog';
import { PageShell } from '@editor/widget/shell/page-shell';
import { ResourceItem } from '@editor/feature/resource/resource-item';
import { useWorkspaceStore } from '@editor/stores/workspace';

export function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const workspace = useWorkspaceStore((s) => s.current);
  const setWorkspace = useWorkspaceStore((s) => s.setCurrent);
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <PageShell titleBarProps={{ title: t('ホーム') }}>
      <FormSection title={t('プロジェクト管理')}>
        <MenuCard
          onClick={() => {
            navigate('/resources/manifest/new');
          }}
          icon={Sparkles}
          title={t('新規作成')}
          description={t('新しいゲームを作成')}
        />

        <MenuCard
          onClick={() => setPickerOpen(true)}
          icon={FolderUp}
          title={t('ロード')}
          description={t('過去に作ったゲームを開く')}
        />
        {workspace.manifestId != null && (
          <>
            <MenuCard
              onClick={() => navigate('/play')}
              icon={Play}
              title={t('プレー')}
              description={workspace.manifestId}
            />
            <MenuCard icon={Settings2} title={t('コンフィグ')} description={t('初期設定を変更')} />
          </>
        )}
      </FormSection>
      <FormSection title={t('グループ管理')}>
        <MenuCard
          onClick={() => {
            navigate('/namespaces/new');
          }}
          icon={Sparkles}
          title={t('新規作成')}
          description={t('新しいグループを作成')}
        />
      </FormSection>
      <SelectDialog
        open={pickerOpen}
        onClose={() => {
          setPickerOpen(false);
        }}
        title={t('プロジェクトを選択')}
        onCommit={(id) => {
          setWorkspace({ manifestId: id });
        }}
        renderItem={(id) => <ResourceItem id={id} />}
        mergeQuery={(q) => [
          { name: 'q', value: q },
          { name: 'type', op: 'eq', value: 'manifest' },
        ]}
        useInfiniteSearch={resourceRepository.useInfiniteSearch}
      />
    </PageShell>
  );
}
