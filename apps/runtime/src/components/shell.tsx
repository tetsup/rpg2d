import { RefObject } from 'react';
import type { GameApp } from '@tetsup/web2d';
import type { RpgKey } from '@sharedTypes/engine';
import { useRuntimeUiStateStore } from '../stores/ui-state';
import { RuntimeHud } from './hud';
import { RuntimeToolbar } from './toolbar';
import { RuntimeViewport } from './viewport';
import { SoftPad } from './softpad';
import '../styles/layout.css';

export function RuntimeShell({
  appRef,
  canvasRef,
  embedded = false,
}: {
  appRef: RefObject<GameApp<RpgKey> | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  embedded?: boolean;
}) {
  const showHud = useRuntimeUiStateStore((s) => s.showHud);
  const showSoftPad = useRuntimeUiStateStore((s) => s.showSoftPad);

  return (
    <div className={embedded ? 'runtime-shell runtime-shell--embedded' : 'runtime-shell'}>
      <RuntimeViewport canvasRef={canvasRef} />
      {showHud && <RuntimeHud appRef={appRef} />}
      <RuntimeToolbar appRef={appRef} />
      {showSoftPad && <SoftPad />}
    </div>
  );
}
