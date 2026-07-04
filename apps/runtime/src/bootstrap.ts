import { GameApp, resolveTransparentMode, type KeyAssignment, type TransparentMode } from '@tetsup/web2d';
import { RpgCore } from '@engine/index';
import type { RpgKey } from '@sharedTypes/engine';
import type { ManifestData } from '@sharedTypes/resource/manifest';
import type { AssignPad } from './hooks/softpad';
import { getApiBaseUrl } from './config';

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

export const DEFAULT_KEY_ASSIGNMENT: KeyAssignment<RpgKey> = {
  ArrowLeft: 'left',
  ArrowRight: 'right',
  ArrowUp: 'up',
  ArrowDown: 'down',
  Enter: 'enter',
  Escape: 'esc',
};

const FETCH_INIT: RequestInit = { credentials: 'include' };

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

export function createEditorRuntimeConfig(
  manifestId: string,
  overrides?: Pick<RuntimeConfig, 'startFieldId' | 'startX' | 'startY'>
): RuntimeConfig {
  return {
    mode: 'api',
    manifestId,
    resourceUri: '/api/resources',
    ...overrides,
  };
}

export async function setupMockIfNeeded(mode: RuntimeMode): Promise<void> {
  if (mode !== 'mock') return;
  const { worker } = await import('./api/browser');
  await worker.start({
    onUnhandledRequest: 'bypass',
  });
}

export function resolveResourceUri(config: RuntimeConfig): string {
  if (config.resourceUri) return config.resourceUri;
  switch (config.mode) {
    case 'mock':
      return '/api/resources';
    default:
      return `${getApiBaseUrl()}/api/resources`;
  }
}

export async function loadManifest(manifestId: string, resourceUri: string): Promise<ManifestData> {
  const response = await fetch(`${resourceUri}/${manifestId}`, FETCH_INIT);
  if (!response.ok) {
    throw new Error(`Failed to load manifest: ${manifestId}`);
  }
  const body = await response.json();
  return body.data as ManifestData;
}

export function applyEditorOverrides(manifest: ManifestData, config: RuntimeConfig): ManifestData {
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

export type RuntimeSession = {
  app: GameApp<RpgKey>;
};

export async function createRuntimeSession({
  canvas,
  config,
  assignPad,
}: {
  canvas: HTMLCanvasElement;
  config: RuntimeConfig;
  assignPad: AssignPad;
}): Promise<RuntimeSession> {
  await setupMockIfNeeded(config.mode);
  const resourceUri = resolveResourceUri(config);
  const manifest = await loadManifest(config.manifestId, resourceUri);
  const resolvedManifest = applyEditorOverrides(manifest, config);
  const engine = new RpgCore(resolvedManifest, { resourceUri });
  const app = new GameApp(canvas, engine, {
    maxObjects: 10000,
    rectSize: {
      width: resolvedManifest.config.screen.width,
      height: resolvedManifest.config.screen.height,
    },
    keyAssignment: DEFAULT_KEY_ASSIGNMENT,
    assignPad,
  });
  const mode: TransparentMode = resolveTransparentMode();
  app.setTransparentMode(mode);
  return { app };
}
