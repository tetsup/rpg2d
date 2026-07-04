import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { createEditorRuntimeConfig, type RuntimeConfig } from '@runtime/bootstrap';
import { useWorkspaceStore } from '@editor/stores/workspace';

function parseOptionalNumber(value: string | null): number | undefined {
  if (value == null || value === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

/** Drives play from the current workspace. Remount only when applying DB edits. */
export function usePlaySession() {
  const [searchParams] = useSearchParams();
  const manifestId = useWorkspaceStore((s) => s.current.manifestId);
  const [sessionKey, setSessionKey] = useState(0);

  const runtimeConfig = useMemo((): RuntimeConfig | null => {
    if (!manifestId) return null;
    return createEditorRuntimeConfig(manifestId, {
      startFieldId: searchParams.get('field') ?? undefined,
      startX: parseOptionalNumber(searchParams.get('x')),
      startY: parseOptionalNumber(searchParams.get('y')),
    });
  }, [manifestId, searchParams]);

  /** Re-fetch workspace resources from the API after editing them elsewhere. */
  const applyChanges = () => {
    setSessionKey((current) => current + 1);
  };

  return {
    manifestId,
    runtimeConfig,
    sessionKey,
    applyChanges,
  };
}
