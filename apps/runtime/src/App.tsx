import { useEffect, useRef } from 'react';
import { GameApp, resolveTransparentMode, type KeyAssignment, type TransparentMode } from '@tetsup/web2d';
import { RpgCore } from '@engine/index';
import type { RpgKey } from '@sharedTypes/engine';
import type { ManifestData } from '@sharedTypes/resource/manifest';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<GameApp<RpgKey> | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const keyAssignment: KeyAssignment<RpgKey> = {
      ArrowLeft: 'left',
      ArrowRight: 'right',
      ArrowUp: 'up',
      ArrowDown: 'down',
      Enter: 'enter',
      Escape: 'esc',
    };

    const manifest: ManifestData = {
      id: 'sample/manifest/v0',
      type: 'manifest',
      initialState: {
        core: {
          variables: new Map(),
          mode: 'field',
          players: ['sample/player/hero.v0'],
        },
        field: {
          fieldId: 'sample/field/start-field.v0',
          pos: { x: 30, y: 40 },
          direction: 'down',
          actionIds: [],
        },
      },
      config: {
        blockSize: { width: 16, height: 16 },
        textSize: { width: 8, height: 8 },
        moveDurationMs: 500,
        screen: { width: 320, height: 240 },
        defaultMessagePanel: 'sample/panel/message.v0',
        messageConfig: {
          speedMs: 100,
          margin: { left: 2, right: 2, top: 1, bottom: 1 },
        },
      },
      schemas: {
        playerState: {
          hp: { type: 'number', asInt: true },
        },
      },
    };

    const config = {
      resourceUri: 'http://localhost:3000/api/resource',
    };

    const app = new GameApp(canvasRef.current, new RpgCore(manifest, config), {
      maxObjects: 10000,
      rectSize: { width: 320, height: 240 },
      keyAssignment,
    });

    const mode: TransparentMode = resolveTransparentMode();
    app.setTransparentMode(mode);

    appRef.current = app;

    return () => {
      app.pause();
    };
  }, []);

  return (
    <div>
      <canvas ref={canvasRef} width={320} height={240} />

      <button onClick={() => appRef.current?.start()}>Start</button>

      <button onClick={() => appRef.current?.pause()}>Pause</button>

      <button onClick={() => appRef.current?.advance(1000)}>Step</button>
    </div>
  );
}
