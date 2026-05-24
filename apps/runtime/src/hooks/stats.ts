import { type RefObject, useSyncExternalStore } from 'react';
import type { GameApp } from '@tetsup/web2d';
import type { RpgKey } from '@sharedTypes/engine';

const emptySubscribe = () => () => {};

const emptySnapshot = () => undefined;

export function useEngineStats(appRef: RefObject<GameApp<RpgKey> | null>) {
  return useSyncExternalStore(
    appRef.current?.stat.subscribe ?? emptySubscribe,
    appRef.current?.stat.getSnapshot ?? emptySnapshot
  );
}
