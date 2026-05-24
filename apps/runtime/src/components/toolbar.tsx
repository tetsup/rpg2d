import { RefObject } from 'react';
import type { GameApp } from '@tetsup/web2d';
import type { RpgKey } from '@sharedTypes/engine';
import { useEngineStats } from '@runtime/hooks/stats';
import { useRuntimeUiStateStore } from '../stores/ui-state';

export function RuntimeToolbar({ appRef }: { appRef: RefObject<GameApp<RpgKey> | null> }) {
  const showHud = useRuntimeUiStateStore((s) => s.showHud);
  const showSoftPad = useRuntimeUiStateStore((s) => s.showSoftPad);
  const toggleHud = useRuntimeUiStateStore((s) => s.toggleHud);
  const toggleSoftPad = useRuntimeUiStateStore((s) => s.toggleSoftPad);

  const stats = useEngineStats(appRef);

  return (
    <div className="runtime-toolbar">
      <div className="runtime-toolbar-group">
        <button data-active={showHud} onClick={toggleHud}>
          HUD
        </button>
        <button data-active={showSoftPad} onClick={toggleSoftPad}>
          PAD
        </button>
      </div>
      <div className="runtime-toolbar-group">
        {stats?.clock.phase === 'running' ? (
          <button onClick={() => appRef.current?.pause()}>PAUSE</button>
        ) : (
          <button
            data-active={stats?.clock.phase === 'ready'}
            onClick={() => {
              appRef.current?.start();
            }}
          >
            START
          </button>
        )}
      </div>
      <div className="runtime-toolbar-slider">
        <span>x{stats?.clock.speed.toFixed(1)}</span>
        <input
          type="range"
          min={0.25}
          max={4}
          step={0.25}
          defaultValue={1}
          onChange={(e) => appRef.current?.changeSpeed(Number(e.target.value))}
        />
      </div>
    </div>
  );
}
