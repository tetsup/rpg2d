import type { EntityData, EntityDeps } from '@/schemas/entity';
import { ResourceBase } from '../core/resource-base';
import type { GameContext } from '../core/game-context';
import type { Action } from './action';
import type { Skin } from './skin';
import type { Texture } from './texture';

export class Entity extends ResourceBase<'entity'> {
  static async loadDeps(ctx: GameContext, data: EntityData): Promise<EntityDeps> {
    const actions = await Promise.all(
      data.actions.map(async ({ trigger, action }) => ({
        trigger,
        action: (await ctx.resources.get(action, 'action')) as Action,
      }))
    );
    if (data.visual === 'skin') {
      const skin = (await ctx.resources.get(data.skin, 'skin')) as Skin;
      return { visual: data.visual, skin, actions };
    } else if (data.visual === 'texture') {
      const texture = (await ctx.resources.get(data.texture, 'texture')) as Texture;
      return { visual: data.visual, texture, actions };
    } else return { visual: data.visual, actions };
  }
  get allowOverwrap() {
    return this.data.allowOverwrap;
  }
  get moveDurationMs() {
    return this.data.moveDurationMs;
  }
}
