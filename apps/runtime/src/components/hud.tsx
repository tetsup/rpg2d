import type { RefObject } from 'react';
import type { RpgCore } from '@engine/index';
import { useEngineStats } from '../hooks/stats';

export function RuntimeHud({ engineRef }: { engineRef: RefObject<RpgCore | null> }) {
  const stats = useEngineStats(engineRef);
  return (
    <div className="runtime-hud">
      <div>STATUS: {stats?.isRunning ? 'RUNNING' : stats?.isReady ? 'STANDBY' : 'NOT READY'}</div>
      <div>
        TPS: {stats?.intervalTps ?? '-'} / {stats?.tps ?? '-'}
      </div>
      <div>
        FPS: {stats?.intervalFps ?? '-'} / {stats?.fps ?? '-'}
      </div>
    </div>
  );
}
