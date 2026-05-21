import { GameApp } from '@tetsup/web2d';
import { RpgCore } from '@engine/index';
import { useEngineStats } from '@runtime/hooks/stats';
import { useRuntimeUiStateStore } from '../stores/ui-state';
import { RpgKey } from '@sharedTypes/engine';

export function RuntimeToolbar({ app, engine }: { app: GameApp<RpgKey> | null; engine: RpgCore | null }) {
  const layoutMode = useRuntimeUiStateStore((s) => s.layoutMode);
  const showHud = useRuntimeUiStateStore((s) => s.showHud);
  const showSoftPad = useRuntimeUiStateStore((s) => s.showSoftPad);
  const setLayoutMode = useRuntimeUiStateStore((s) => s.setLayoutMode);
  const toggleHud = useRuntimeUiStateStore((s) => s.toggleHud);
  const toggleSoftPad = useRuntimeUiStateStore((s) => s.toggleSoftPad);

  const stat = useEngineStats(engine);

  return (
    <div className="runtime-toolbar">
      <div className="runtime-toolbar-group">
        <button data-active={layoutMode === 'auto'} onClick={() => setLayoutMode('auto')}>
          AUTO
        </button>
        <button data-active={layoutMode === 'portrait'} onClick={() => setLayoutMode('portrait')}>
          PORTRAIT
        </button>
        <button data-active={layoutMode === 'landscape'} onClick={() => setLayoutMode('landscape')}>
          LANDSCAPE
        </button>
        <button data-active={showHud} onClick={toggleHud}>
          HUD
        </button>
        <button data-active={showSoftPad} onClick={toggleSoftPad}>
          PAD
        </button>
      </div>
      <div className="runtime-toolbar-group">
        {stat?.isRunning ? (
          <button onClick={() => app?.pause()}>PAUSE</button>
        ) : (
          <button data-active={stat?.isRunning} onClick={() => app?.start()}>
            START
          </button>
        )}
      </div>
      <div className="runtime-toolbar-slider">
        <span>x{stat?.speed.toFixed(1)}</span>
        <input
          type="range"
          min={0.25}
          max={4}
          step={0.25}
          defaultValue={1}
          onChange={(e) => app?.setSpeed(Number(e.target.value))}
        />
      </div>
    </div>
  );
}
