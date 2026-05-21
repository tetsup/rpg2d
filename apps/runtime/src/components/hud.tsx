import { RpgCore } from '@engine/index';
import { useEngineStats } from '../hooks/stats';

export function RuntimeHud({ engine }: { engine: RpgCore | null }) {
  const stats = useEngineStats(engine);
  return (
    <div className="runtime-hud">
      <div>STATUS: {stats?.isRunning ? 'RUNNING' : 'STOPPING'}</div>
      <div>FPS: {stats?.fps ?? '-'}</div>
    </div>
  );
}
