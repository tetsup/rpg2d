import { type RefObject, useSyncExternalStore } from 'react';
import type { RpgCore } from '@engine/index';

const emptySubscribe = () => () => {};

const emptySnapshot = () => undefined;

export function useEngineStats(engineRef: RefObject<RpgCore | null>) {
  return useSyncExternalStore(
    engineRef.current?.stat.subscribe ?? emptySubscribe,
    engineRef.current?.stat.getSnapshot ?? emptySnapshot
  );
}
