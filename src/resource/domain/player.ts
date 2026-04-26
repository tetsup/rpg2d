import type { PlayerData, PlayerDeps } from '@/schemas/player';
import { ResourceBase } from '../core/resource-base';
import type { GameContext } from '../core/game-context';
import type { Skin } from './skin';

export class Player extends ResourceBase<'player'> {
  static async loadDeps(ctx: GameContext, data: PlayerData): Promise<PlayerDeps> {
    const initialSkin = (await ctx.resources.get(data.initialSkin, 'skin')) as Skin;
    return {
      initialSkin,
    };
  }

  get skin() {
    return this.deps.initialSkin;
  }
}
