import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { FolderUp, Play, Settings2, Sparkles } from 'lucide-react';
import { MenuCard } from '@editor/components/parts/menu-card';
import { DocumentPickerDialog } from '@editor/components/parts/document-picker-dialog';
import { LayoutShell } from '@editor/components/features/layout/layout-shell';
import { ControlSection } from '@editor/components/forms/control-section';
import { useWorkspaceStore } from '@editor/stores/workspace';

export function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const workspace = useWorkspaceStore((s) => s.current);
  const setWorkspace = useWorkspaceStore((s) => s.setCurrent);
  const [pickerOpen, setPickerOpen] = useState(false);

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
      <DocumentPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        title={t('プロジェクトを選択')}
        collectionName="resources"
        resourceType="manifest"
        onSelect={(id) => {
          setWorkspace({ manifestId: id });
        }}
        onCreate={() => {
          navigate('/resources/manifest/new');
        }}
      />
    </LayoutShell>
  );
}
