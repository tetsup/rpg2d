import { RefObject } from 'react';
import type { GameApp, InputManager } from '@tetsup/web2d';
import type { RpgKey } from '@sharedTypes/engine';
import { useRuntimeLayout } from '../hooks/layout';
import { useRuntimeUiStateStore } from '../stores/ui-state';
import { RuntimeHud } from './hud';
import { RuntimeToolbar } from './toolbar';
import { RuntimeViewport } from './viewport';
import { SoftPad } from './softpad';
import '../styles/layout.css';
import { RpgCore } from '@engine/index';

export function RuntimeShell({
  app,
  engine,
  canvasRef,
}: {
  app: GameApp<RpgKey> | null;
  engine: RpgCore | null;
  canvasRef: RefObject<HTMLCanvasElement | null>;
}) {
  const { layout } = useRuntimeLayout();
  const showHud = useRuntimeUiStateStore((s) => s.showHud);
  const showSoftPad = useRuntimeUiStateStore((s) => s.showSoftPad);

  return (
    <div className="runtime-shell" data-layout={layout}>
      <RuntimeViewport canvasRef={canvasRef} />
      {showHud && <RuntimeHud engine={engine} />}
      <RuntimeToolbar app={app} engine={engine} />
      {showSoftPad && <SoftPad />}
    </div>
  );
}
