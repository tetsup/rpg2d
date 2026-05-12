import type { SkinData, SkinDeps } from '@/schemas/image/skin';
import { ResourceBase } from '../core/resource-base';
import type { GameContext } from '../core/game-context';
import { Direction2d } from '@/types/engine';

export class Skin extends ResourceBase<'skin'> {
  static async loadDeps(ctx: GameContext, data: SkinData): Promise<SkinDeps> {
    return {
      textures: {
        left: await ctx.resources.get(data.textures.left, 'texture'),
        right: await ctx.resources.get(data.textures.right, 'texture'),
        up: await ctx.resources.get(data.textures.up, 'texture'),
        down: await ctx.resources.get(data.textures.down, 'texture'),
      },
    };
  }

  resolveLayers = (nowMs: number, direction: Direction2d) => {
    return this.deps.textures[direction].resolveLayers(nowMs);
  };
}
