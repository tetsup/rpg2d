import { TileSchema, type TileData } from '@/schemas/tile';
import { TextureSchema } from '@/schemas/image/texture';
import { ResourceBase } from './resource-base';
import type { ResourceManager } from './resource-manager';
import { Action } from './action';
import { Texture } from './texture';

export class Tile extends ResourceBase<'tile'> {
  static schema = TileSchema;

  static async loadDeps(resources: ResourceManager, data: TileData) {
    return {
      texture: await resources.get(data.texture, TextureSchema, Texture.factory),
      actions: Object.fromEntries(
        await Promise.all(
          Object.entries(data.actions).map(async ([key, val]) => [key, await Action.factory(resources, val)])
        )
      ),
    };
  }

  currentImage(nowMs: number) {
    return this.deps.texture.currentImage(nowMs);
  }
}
