import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { FolderUp, Settings2, Sparkles } from 'lucide-react';
import { MenuCard } from '@editor/components/parts/menu-card';
import { LayoutShell } from '@editor/components/features/layout/layout-shell';
import { ControlSection } from '@editor/components/forms/control-section';
import { playPath } from '@editor/lib/play/navigation';
import { useWorkspaceStore } from '@editor/stores/workspace';

export function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const workspace = useWorkspaceStore((s) => s.current);

  return (
    <LayoutShell titleBarProps={{ title: t('ホーム') }}>
      <ControlSection title={t('プロジェクト管理')}>
        <MenuCard
          onClick={() => {
            navigate('/resources/manifest/new');
          }}
          icon={Sparkles}
          title={t('新規作成')}
          description={t('新しいゲームを作成')}
        />

        <MenuCard
          onClick={() => navigate(playPath(undefined, { pick: true }))}
          icon={FolderUp}
          title={t('ロード')}
          description={t('過去に作ったゲームを開く')}
        />
        {workspace.manifestId != null && (
          <MenuCard
            onClick={() => navigate(playPath(workspace.manifestId))}
            icon={Settings2}
            title={t('プレー')}
            description={workspace.manifestId}
          />
        )}
      </ControlSection>
      <ControlSection title={t('グループ管理')}>
        <MenuCard
          onClick={() => {
            navigate('/namespaces/new');
          }}
          icon={Sparkles}
          title={t('新規作成')}
          description={t('新しいグループを作成')}
        />
      </ControlSection>
    </LayoutShell>
  );
}
