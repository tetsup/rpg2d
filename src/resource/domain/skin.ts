import type { SkinData, SkinDeps } from '@/schemas/image/skin';
import { ResourceBase } from '../core/resource-base';
import type { GameContext } from '../core/game-context';
import type { Texture } from './texture';
import { Direction2d } from '@/types/engine';

export class Skin extends ResourceBase<'skin'> {
  static async loadDeps(ctx: GameContext, data: SkinData): Promise<SkinDeps> {
    return {
      textures: {
        left: (await ctx.resources.get(data.textures.left, 'texture')) as Texture,
        right: (await ctx.resources.get(data.textures.right, 'texture')) as Texture,
        up: (await ctx.resources.get(data.textures.up, 'texture')) as Texture,
        down: (await ctx.resources.get(data.textures.down, 'texture')) as Texture,
      },
    };
  }

  resolveLayers(nowMs: number, direction: Direction2d) {
    return this.deps.textures[direction].resolveLayers(nowMs);
  }
}
