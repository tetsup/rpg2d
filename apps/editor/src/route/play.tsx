import { useTranslation } from 'react-i18next';
import { RefreshCw } from 'lucide-react';
import { RuntimeHost } from '@runtime/runtime-host';
import '@runtime/styles/layout.css';
import { LayoutShell } from '@editor/components/features/layout/layout-shell';
import { ManifestPickerDialog } from '@editor/components/features/play/manifest-picker-dialog';
import { Button } from '@editor/components/ui/button';
import { usePlaySession } from '@editor/hooks/play/use-play-session';

export function PlayPage() {
  const { t } = useTranslation();
  const {
    manifestId,
    runtimeConfig,
    sessionKey,
    pickerOpen,
    setPickerOpen,
    selectManifest,
    reload,
    openPicker,
  } = usePlaySession();

  return (
    <>
      <LayoutShell
        flush
        titleBarProps={{
          title: t('プレー'),
          subtitle: manifestId,
          rightSlot: (
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={openPicker}>
                {t('マニフェスト')}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={reload}
                disabled={runtimeConfig == null}
              >
                <RefreshCw className="size-4" />
                {t('再読み込み')}
              </Button>
            </div>
          ),
        }}
      >
        {runtimeConfig == null ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 p-4 text-center">
            <p className="text-sm text-muted-foreground">{t('プレイするマニフェストを選択してください')}</p>
            <Button type="button" onClick={openPicker}>
              {t('マニフェストを選択')}
            </Button>
          </div>
        ) : (
          <RuntimeHost key={sessionKey} config={runtimeConfig} embedded />
        )}
      </LayoutShell>
      <ManifestPickerDialog open={pickerOpen} onOpenChange={setPickerOpen} onSelect={selectManifest} />
    </>
  );
}
