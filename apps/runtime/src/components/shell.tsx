import { RefObject } from 'react';
import type { GameApp } from '@tetsup/web2d';
import type { RpgKey } from '@sharedTypes/engine';
import { useRuntimeLayout } from '../hooks/layout';
import { useRuntimeUiStateStore } from '../stores/ui-state';
import { RuntimeHud } from './hud';
import { RuntimeToolbar } from './toolbar';
import { RuntimeViewport } from './viewport';
import { SoftPad } from './softpad';
import '../styles/layout.css';

export function RuntimeShell({
  appRef,
  canvasRef,
}: {
  appRef: RefObject<GameApp<RpgKey> | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
}) {
  const { layout } = useRuntimeLayout();
  const showHud = useRuntimeUiStateStore((s) => s.showHud);
  const showSoftPad = useRuntimeUiStateStore((s) => s.showSoftPad);

  return (
    <div className="runtime-shell" data-layout={layout}>
      <RuntimeViewport canvasRef={canvasRef} />
      {showHud && <RuntimeHud appRef={appRef} />}
      <RuntimeToolbar appRef={appRef} />
      {showSoftPad && <SoftPad />}
    </div>
  );
}
