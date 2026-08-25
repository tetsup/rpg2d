import type { ActionDeps } from '@engine/types/resource-deps';
import type { ActionData } from '@sharedTypes/resource/action';
import type { GameContextLike } from '../core/game-context';
import type { ResourceBase } from '../core/resource-base';

export class Action implements ResourceBase<'action'> {
  constructor(
    readonly ctx: GameContextLike,
    readonly id: string,
    readonly data: ActionData,
    readonly deps: ActionDeps
  ) {}

  static async loadDeps(): Promise<ActionDeps> {
    return {};
  }

  getSequence = () => this.data.sequence;
}
