import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { createEditorRuntimeConfig } from '@runtime/bootstrap';
import { RuntimeHost } from '@runtime/runtime-host';
import '@runtime/styles/layout.css';
import { LayoutShell } from '@editor/components/features/layout/layout-shell';
import { ManifestPickerDialog } from '@editor/components/features/play/manifest-picker-dialog';
import { Button } from '@editor/components/ui/button';
import { useWorkspaceStore } from '@editor/stores/workspace';

function parseOptionalNumber(value: string | null): number | undefined {
  if (value == null || value === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function PlayPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const workspaceManifestId = useWorkspaceStore((s) => s.current.manifestId);
  const setWorkspace = useWorkspaceStore((s) => s.setCurrent);
  const [sessionKey, setSessionKey] = useState(0);
  const [pickerOpen, setPickerOpen] = useState(false);

  const manifestId = searchParams.get('manifest') ?? workspaceManifestId;

  const runtimeConfig = useMemo(() => {
    if (!manifestId) return null;
    return createEditorRuntimeConfig(manifestId, {
      startFieldId: searchParams.get('field') ?? undefined,
      startX: parseOptionalNumber(searchParams.get('x')),
      startY: parseOptionalNumber(searchParams.get('y')),
    });
  }, [manifestId, searchParams]);

  const handleManifestSelect = (id: string) => {
    setWorkspace({ manifestId: id });
    setSearchParams({ manifest: id }, { replace: true });
    setSessionKey((current) => current + 1);
  };

  const handleReload = () => {
    setSessionKey((current) => current + 1);
  };

  return (
    <>
      <LayoutShell
        flush
        titleBarProps={{
          title: t('プレー'),
          subtitle: manifestId,
          rightSlot: (
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setPickerOpen(true)}>
                {t('マニフェスト')}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleReload}
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
            <Button type="button" onClick={() => setPickerOpen(true)}>
              {t('マニフェストを選択')}
            </Button>
          </div>
        ) : (
          <RuntimeHost key={sessionKey} config={runtimeConfig} embedded />
        )}
      </LayoutShell>
      <ManifestPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={handleManifestSelect}
      />
    </>
  );
}
