import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { createEditorRuntimeConfig, type RuntimeConfig } from '@runtime/bootstrap';
import { useWorkspaceStore } from '@editor/stores/workspace';

function parseOptionalNumber(value: string | null): number | undefined {
  if (value == null || value === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function usePlaySession() {
  const [searchParams, setSearchParams] = useSearchParams();
  const workspaceManifestId = useWorkspaceStore((s) => s.current.manifestId);
  const setWorkspace = useWorkspaceStore((s) => s.setCurrent);
  const [sessionKey, setSessionKey] = useState(0);
  const [pickerOpen, setPickerOpen] = useState(false);

  const manifestId = searchParams.get('manifest') ?? workspaceManifestId ?? undefined;
  const requestPicker = searchParams.get('pick') === '1';

  useEffect(() => {
    if (requestPicker) {
      setPickerOpen(true);
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('pick');
      setSearchParams(nextParams, { replace: true });
    }
  }, [requestPicker, searchParams, setSearchParams]);

  const runtimeConfig = useMemo((): RuntimeConfig | null => {
    if (!manifestId) return null;
    return createEditorRuntimeConfig(manifestId, {
      startFieldId: searchParams.get('field') ?? undefined,
      startX: parseOptionalNumber(searchParams.get('x')),
      startY: parseOptionalNumber(searchParams.get('y')),
    });
  }, [manifestId, searchParams]);

  const selectManifest = (id: string) => {
    setWorkspace({ manifestId: id });
    setSearchParams({ manifest: id }, { replace: true });
    setSessionKey((current) => current + 1);
    setPickerOpen(false);
  };

  const reload = () => {
    setSessionKey((current) => current + 1);
  };

  const openPicker = () => {
    setPickerOpen(true);
  };

  return {
    manifestId,
    runtimeConfig,
    sessionKey,
    pickerOpen,
    setPickerOpen,
    selectManifest,
    reload,
    openPicker,
  };
}
