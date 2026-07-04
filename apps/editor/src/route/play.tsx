import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { RuntimeHost } from '@runtime/runtime-host';
import '@runtime/styles/layout.css';
import { LayoutShell } from '@editor/components/features/layout/layout-shell';
import { Button } from '@editor/components/ui/button';
import { usePlaySession } from '@editor/hooks/use-play-session';
import { useWorkspaceStore } from '@editor/stores/workspace';

export function PlayPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const projectId = useWorkspaceStore((s) => s.current.manifestId);
  const { runtimeConfig, sessionKey, applyChanges } = usePlaySession();

  return (
    <LayoutShell
      flush
      titleBarProps={{
        title: t('プレー'),
        subtitle: projectId,
        rightSlot: (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={applyChanges}
            disabled={runtimeConfig == null}
          >
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
    </LayoutShell>
  );
}
