import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { RuntimeConfig } from '@runtime/bootstrap';
import { useWorkspaceStore } from '@editor/app/stores/workspace';

function parseOptionalNumber(value: string | null): number | undefined {
  if (value == null || value === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

/** Boots runtime from the current workspace; remount only when applying DB edits. */
export function usePlaySession() {
  const [searchParams] = useSearchParams();
  const manifestId = useWorkspaceStore((s) => s.current.manifestId);
  const [sessionKey, setSessionKey] = useState(0);

  const runtimeConfig = useMemo((): RuntimeConfig | null => {
    if (!manifestId) return null;
    return {
      mode: 'api',
      manifestId,
      resourceUri: '/api/resources',
      startFieldId: searchParams.get('field') ?? undefined,
      startX: parseOptionalNumber(searchParams.get('x')),
      startY: parseOptionalNumber(searchParams.get('y')),
    };
  }, [manifestId, searchParams]);

  const applyChanges = () => {
    setSessionKey((current) => current + 1);
  };

  return {
    runtimeConfig,
    sessionKey,
    applyChanges,
  };
}
