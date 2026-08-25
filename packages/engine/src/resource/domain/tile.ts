import type { TileData } from '@sharedTypes/resource/tile';
import type { TileDeps } from '@engine/types/resource-deps';
import { ResourceBase, ResourceInstance } from '@engine/resource/core/resource-base';
import type { GameContextLike } from '../core/game-context';

export class Tile extends ResourceBase<'tile'> implements ResourceInstance<'tile'> {
  static async loadDeps(ctx: GameContextLike, data: TileData): Promise<TileDeps> {
    return {
      texture: await ctx.resources.get(data.texture, 'texture'),
      actions: await Promise.all(
        Object.entries(data.actions ?? []).map(async ([trigger, action]) => ({
          trigger,
          action: await ctx.resources.get(action, 'action'),
        }))
      ),
    };
  }

  get allowOverwrap() {
    return this.data.allowOverwrap;
  }

  resolveLayers = (nowMs: number) => {
    return this.deps.texture.resolveLayers(nowMs);
  };
}
