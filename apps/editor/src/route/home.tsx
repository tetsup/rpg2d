import { useTranslation } from 'react-i18next';
import { FolderUp, Settings2, Sparkles } from 'lucide-react';
import { MenuCard } from '@editor/components/parts/menu-card';
import { useWorkspaceStore } from '@editor/stores/manifest';
import { LayoutShell } from '@editor/components/features/layout/layout-shell';

export function HomePage() {
  const { t } = useTranslation();
  const workspace = useWorkspaceStore((s) => s.current);

  return (
    <LayoutShell titleBarProps={{ title: t('ホーム') }}>
      <div className="space-y-4 p-4">
        <MenuCard icon={Sparkles} title={t('新規作成')} description={t('新しいゲームを作成')} />

        <MenuCard icon={FolderUp} title={t('ロード')} description={t('過去に作ったゲームを開く')} />
        {workspace.manifestId != null && (
          <MenuCard icon={Settings2} title={t('コンフィグ')} description={t('初期設定を変更')} />
        )}
      </div>
    </LayoutShell>
  );
}
