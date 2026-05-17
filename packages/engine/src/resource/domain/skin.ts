import type { Direction2d } from '@sharedTypes/engine';
import type { SkinData } from '@sharedTypes/resource/skin';
import type { SkinDeps } from '@engine/types/resource-deps';
import { ResourceBase } from '../core/resource-base';
import type { GameContext } from '../core/game-context';

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
