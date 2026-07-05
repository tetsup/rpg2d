import { useEffect, useRef, useState } from 'react';
import type { GameApp } from '@tetsup/web2d';
import type { RpgKey } from '@sharedTypes/engine';
import { createRuntimeSession, type RuntimeConfig } from './bootstrap';
import { RuntimeShell } from './components/shell';
import { useAssignPad } from './hooks/softpad';

type RuntimeHostProps = {
  config: RuntimeConfig;
  /** When true, fills the parent container instead of the viewport. */
  embedded?: boolean;
};

export function RuntimeHost({ config, embedded = false }: RuntimeHostProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<GameApp<RpgKey> | null>(null);
  const [_, setReady] = useState(0);
  void _;
  const assignPad = useAssignPad();

  useEffect(() => {
    if (!canvasRef.current) return;
    let disposed = false;
    let sessionApp: GameApp<RpgKey> | null = null;

    async function bootstrap() {
      const { app } = await createRuntimeSession({
        canvas: canvasRef.current!,
        config,
        assignPad,
      });
      if (disposed) {
        app.pause();
        return;
      }
      sessionApp = app;
      appRef.current = app;
      setReady((current) => current + 1);
    }

    void bootstrap();

    return () => {
      disposed = true;
      sessionApp?.pause();
      appRef.current = null;
    };
  }, [config, assignPad]);

  return <RuntimeShell appRef={appRef} canvasRef={canvasRef} embedded={embedded} />;
}
