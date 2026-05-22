import { RefObject, useEffect, useState } from 'react';
import { RpgCore } from '@engine/index';

export function useEngineStats(engineRef: RefObject<RpgCore | null>) {
  const [stats, setStats] = useState(engineRef.current?.stat.snapShot());

  useEffect(() => {
    const update = () => {
      setStats(engineRef.current?.stat.snapShot());
    };
    update();
    const intervalId = setInterval(update, 100);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return stats;
}
