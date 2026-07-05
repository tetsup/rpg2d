import { GameApp, resolveTransparentMode, type KeyAssignment, type TransparentMode } from '@tetsup/web2d';
import { RpgCore } from '@engine/index';
import type { RpgKey } from '@sharedTypes/engine';
import type { AssignPad } from './hooks/softpad';
import { getApiBaseUrl } from './config';
import { loadManifest } from './load-manifest';
import {
  applyStartOverrides,
  resolveResourceUri,
  type RuntimeConfig,
  type RuntimeMode,
} from './runtime-config';

export type { RuntimeConfig, RuntimeMode } from './runtime-config';
export { applyStartOverrides, parseRuntimeSearchParams, resolveResourceUri } from './runtime-config';
export { loadManifest } from './load-manifest';

export async function setupMockIfNeeded(mode: RuntimeMode): Promise<void> {
  if (mode !== 'mock') return;
  const { worker } = await import('./api/browser');
  await worker.start({
    onUnhandledRequest: 'bypass',
  });
}

export type RuntimeSession = {
  app: GameApp<RpgKey>;
};

const keyAssignment: KeyAssignment<RpgKey> = {
  ArrowLeft: 'left',
  ArrowRight: 'right',
  ArrowUp: 'up',
  ArrowDown: 'down',
  Enter: 'enter',
  Escape: 'esc',
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
  const resourceUri = resolveResourceUri(config, getApiBaseUrl());
  const manifest = await loadManifest(config.manifestId, resourceUri);
  const resolvedManifest = applyStartOverrides(manifest, config);
  const engine = new RpgCore(resolvedManifest, { resourceUri });
  const app = new GameApp(canvas, engine, {
    maxObjects: 10000,
    rectSize: {
      width: resolvedManifest.config.screen.width,
      height: resolvedManifest.config.screen.height,
    },
    keyAssignment,
    assignPad,
  });
  const mode: TransparentMode = resolveTransparentMode();
  app.setTransparentMode(mode);
  return { app };
}
