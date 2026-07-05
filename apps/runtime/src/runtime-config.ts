import type { ManifestData } from '@sharedTypes/resource/manifest';

export type RuntimeMode = 'mock' | 'api';

export type RuntimeConfig = {
  mode: RuntimeMode;
  manifestId: string;
  startFieldId?: string;
  startX?: number;
  startY?: number;
  /** When set, overrides the default resource base path (e.g. editor proxy `/api/resources`). */
  resourceUri?: string;
};

export function parseRuntimeSearchParams(searchParams: URLSearchParams): RuntimeConfig {
  const mode = (searchParams.get('mode') ?? 'mock') as RuntimeMode;
  return {
    mode,
    manifestId: searchParams.get('manifest') ?? 'sample/manifest/v0',
    startFieldId: searchParams.get('field') ?? undefined,
    startX: searchParams.get('x') ? Number(searchParams.get('x')) : undefined,
    startY: searchParams.get('y') ? Number(searchParams.get('y')) : undefined,
  };
}

export function resolveResourceUri(config: RuntimeConfig, apiBaseUrl: string): string {
  if (config.resourceUri) return config.resourceUri;
  switch (config.mode) {
    case 'mock':
      return '/api/resources';
    default:
      return `${apiBaseUrl}/api/resources`;
  }
}

export function applyStartOverrides(manifest: ManifestData, config: RuntimeConfig): ManifestData {
  return {
    ...manifest,
    initialState: {
      ...manifest.initialState,
      field: {
        ...manifest.initialState.field,
        fieldId: config.startFieldId ?? manifest.initialState.field.fieldId,
        pos: {
          x: config.startX ?? manifest.initialState.field.pos.x,
          y: config.startY ?? manifest.initialState.field.pos.y,
        },
      },
    },
  };
}
