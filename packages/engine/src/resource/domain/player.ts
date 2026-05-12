import type { PlayerData, PlayerDeps } from '@/schemas/player';
import { ResourceBase } from '../core/resource-base';
import type { GameContext } from '../core/game-context';

export class Player extends ResourceBase<'player'> {
  static async loadDeps(ctx: GameContext, data: PlayerData): Promise<PlayerDeps> {
    const initialSkin = await ctx.resources.get(data.initialSkin, 'skin');
    return {
      initialSkin,
    };
  }

  get skin() {
    return this.deps.initialSkin;
  }
}
