import type { RefObject } from 'react';
import type { GameApp } from '@tetsup/web2d';
import type { RpgKey } from '@sharedTypes/engine';
import { useEngineStats } from '../hooks/stats';

const toRoundedString = (v?: number) => (v != null ? `${Math.floor(v)}.${Math.floor((v * 100) % 100)}` : '-');

export function RuntimeHud({ appRef }: { appRef: RefObject<GameApp<RpgKey> | null> }) {
  const stats = useEngineStats(appRef);
  console.log(stats);
  return (
    <div className="runtime-hud">
      <div>
        SCREEN SIZE: {stats?.screenSize.width} x {stats?.screenSize.height}
      </div>
      <div>STATUS: {stats?.clock.phase}</div>
      <div>
        FPS: {toRoundedString(stats?.intervalFps)} / {toRoundedString(stats?.fps)}
      </div>
      <div>
        BUFFER: {stats?.intervalMaxObjects} / {stats?.maxObjects} / {stats?.reservedObjects}
      </div>
      <div>SPEED: x{toRoundedString(stats?.clock.speed)}</div>
    </div>
  );
}
