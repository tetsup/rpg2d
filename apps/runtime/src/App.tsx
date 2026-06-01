import { useEffect, useMemo, useRef, useState } from 'react';
import { GameApp, resolveTransparentMode, type KeyAssignment, type TransparentMode } from '@tetsup/web2d';
import { RpgCore } from '@engine/index';
import type { RpgKey } from '@sharedTypes/engine';
import type { ManifestData } from '@sharedTypes/resource/manifest';
import { getApiBaseUrl } from './config';
import { RuntimeShell } from './components/shell';
import { useAssignPad } from './hooks/softpad';

type RuntimeMode = 'mock' | 'api';

type RuntimeConfig = {
  mode: RuntimeMode;
  manifestId: string;
  startFieldId?: string;
  startX?: number;
  startY?: number;
};

function getSearchParams(): RuntimeConfig {
  const params = new URLSearchParams(window.location.search);
  const mode = (params.get('mode') ?? 'mock') as RuntimeMode;
  return {
    mode,
    manifestId: params.get('manifest') ?? 'sample/manifest/v0',
    startFieldId: params.get('field') ?? undefined,
    startX: params.get('x') ? Number(params.get('x')) : undefined,
    startY: params.get('y') ? Number(params.get('y')) : undefined,
  };
}

async function setupMockIfNeeded(mode: RuntimeMode): Promise<void> {
  if (mode !== 'mock') return;
  const { worker } = await import('./api/browser');
  await worker.start({
    onUnhandledRequest: 'bypass',
  });
}

function resolveResourceUri(mode: RuntimeMode): string {
  switch (mode) {
    case 'mock':
      return '/api/resource';
    default:
      return `${getApiBaseUrl()}/api/resource`;
  }
}

async function loadManifest(manifestId: string, resourceUri: string): Promise<ManifestData> {
  const response = await fetch(`${resourceUri}/${manifestId}`);
  if (!response.ok) {
    throw new Error(`Failed to load manifest: ${manifestId}`);
  }
  return (await response.json()).data;
}

function applyEditorOverrides(manifest: ManifestData, config: RuntimeConfig): ManifestData {
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

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<GameApp<RpgKey> | null>(null);

  const [_, setReady] = useState(0);
  void _;
  const assignPad = useAssignPad();
  const runtimeConfig = useMemo(() => {
    return getSearchParams();
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;
    let disposed = false;
    async function bootstrap() {
      await setupMockIfNeeded(runtimeConfig.mode);
      const resourceUri = resolveResourceUri(runtimeConfig.mode);
      const manifest = await loadManifest(runtimeConfig.manifestId, resourceUri);
      const resolvedManifest = applyEditorOverrides(manifest, runtimeConfig);
      const keyAssignment: KeyAssignment<RpgKey> = {
        ArrowLeft: 'left',
        ArrowRight: 'right',
        ArrowUp: 'up',
        ArrowDown: 'down',
        Enter: 'enter',
        Escape: 'esc',
      };
      const coreConfig = {
        resourceUri,
      };
      const engine = new RpgCore(resolvedManifest, coreConfig);
      const app = new GameApp(canvasRef.current!, engine, {
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
      if (disposed) {
        app.pause();
        return;
      }
      appRef.current = app;
      setReady((current) => current + 1);
    }

    bootstrap();

    return () => {
      disposed = true;
      appRef.current?.pause();
    };
  }, [runtimeConfig]);

  return <RuntimeShell appRef={appRef} canvasRef={canvasRef} />;
}
