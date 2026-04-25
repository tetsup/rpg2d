import type { TileDeps, TileData } from '@/schemas/tile';
import { ResourceBase } from '@/resource/core/resource-base';
import type { GameContext } from '../core/game-context';
import type { Texture } from './texture';

export class Tile extends ResourceBase<'tile'> {
  static async loadDeps(ctx: GameContext, data: TileData): Promise<TileDeps> {
    return {
      texture: (await ctx.resources.get(data.texture, 'texture')) as Texture,
      actions: Object.fromEntries(
        await Promise.all(
          Object.entries(data.actions).map(async ([key, val]) => [key, await ctx.resources.get(val.id, 'field')])
        )
      ),
    };
  }

  get allowOverwrap() {
    return this.data.allowOverwrap;
  }

  resolveLayers(nowMs: number) {
    return this.deps.texture.resolveLayers(nowMs);
  }
}
