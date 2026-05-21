import { useEffect, useState } from 'react';
import { RpgCore } from '@engine/index';

export function useEngineStats(engine: RpgCore | null) {
  const [stats, setStats] = useState(engine?.stat);
  useEffect(() => {
    let frameId = 0;
    const update = () => {
      setStats(engine?.stat);
      frameId = requestAnimationFrame(update);
    };
    update();
    return () => {
      cancelAnimationFrame(frameId);
    };
  }, []);
  return stats;
}
