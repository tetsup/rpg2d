import type { EntityData, EntityDeps } from '@/schemas/entity';
import { ResourceBase } from '../core/resource-base';
import type { GameContext } from '../core/game-context';
import { Direction2d } from '@/types/engine';

export class Entity extends ResourceBase<'entity'> {
  static async loadDeps(ctx: GameContext, data: EntityData): Promise<EntityDeps> {
    const actions = (
      await Promise.all(
        Object.entries(data.actions).map(async ([trigger, action]) =>
          action
            ? {
                trigger,
                action: await ctx.resources.get(action, 'action'),
              }
            : null
        )
      )
    ).filter((v) => v != null);
    if (data.visual === 'skin') {
      const skin = await ctx.resources.get(data.skin, 'skin');
      return { visual: data.visual, skin, actions };
    } else if (data.visual === 'texture') {
      const texture = await ctx.resources.get(data.texture, 'texture');
      return { visual: data.visual, texture, actions };
    } else return { visual: data.visual, actions };
  }
  get allowOverwrap() {
    return this.data.allowOverwrap;
  }
  get moveDurationMs() {
    return this.data.moveDurationMs;
  }

  resolveLayers = (nowMs: number, direction: Direction2d) => {
    return this.deps.visual === 'skin'
      ? this.deps.skin.resolveLayers(nowMs, direction)
      : this.deps.visual === 'texture'
        ? this.deps.texture.resolveLayers(nowMs)
        : [];
  };
}
