import type { VariableState } from '@sharedTypes/engine';
import type { ResourceId } from '@sharedTypes/resource/common';
import type { GameStateLike } from '@engine/resource/core/game-state';

export class DummyGameState implements GameStateLike {
  get = (_id: ResourceId): VariableState | undefined => undefined;
}
