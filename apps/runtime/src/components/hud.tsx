import { RpgCore } from '@engine/index';
import { useEngineStats } from '../hooks/stats';
import { RefObject } from 'react';

export function RuntimeHud({ engineRef }: { engineRef: RefObject<RpgCore | null> }) {
  const stats = useEngineStats(engineRef);
  return (
    <div className="runtime-hud">
      <div>STATUS: {stats?.isRunning ? 'RUNNING' : 'STOPPING'}</div>
      <div>FPS: {stats?.fps ?? '-'}</div>
    </div>
  );
}
