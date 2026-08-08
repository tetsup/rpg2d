import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { Button } from '@base/components/ui/button';
import { RuntimeHost } from '@runtime/runtime-host';
import '@runtime/styles/layout.css';
import { useWorkspaceStore } from '@editor/stores/workspace';
import { usePlaySession } from '@editor/feature/player/use-play-session';
import { PageShell } from '@editor/widget/shell/page-shell';

export function PlayPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const projectId = useWorkspaceStore((s) => s.current.manifestId);
  const { runtimeConfig, sessionKey, applyChanges } = usePlaySession();

  return (
    <PageShell
      flush
      titleBarProps={{
        title: t('プレー'),
        subtitle: projectId,
        rightSlot: (
          <Button type="button" variant="outline" size="sm" onClick={applyChanges} disabled={runtimeConfig == null}>
            <RefreshCw className="size-4" />
            {t('変更を反映')}
          </Button>
        ),
      }}
    >
      {runtimeConfig == null ? (
        <div className="flex h-full flex-col items-center justify-center gap-4 p-4 text-center">
          <p className="text-sm text-muted-foreground">{t('ホームでプロジェクトをロードしてください')}</p>
          <Button type="button" onClick={() => navigate('/')}>
            {t('ホームへ')}
          </Button>
        </div>
      ) : (
        <RuntimeHost key={sessionKey} config={runtimeConfig} embedded />
      )}
    </PageShell>
  );
}
