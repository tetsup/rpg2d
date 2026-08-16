import type { PlayerData } from '@sharedTypes/resource/player';
import type { PlayerDeps } from '@engine/types/resource-deps';
import { ResourceBase } from '../core/resource-base';
import type { GameContextLike } from '../core/game-context';

export class Player extends ResourceBase<'player'> {
  static async loadDeps(ctx: GameContextLike, data: PlayerData): Promise<PlayerDeps> {
    const initialSkin = await ctx.resources.get(data.initialSkin, 'skin');
    return {
      initialSkin,
    };
  }

  get skin() {
    return this.deps.initialSkin;
  }
}
