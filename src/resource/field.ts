import { FieldData, FieldSchema, type TileCode } from '@/schemas/field';
import { ResourceBase } from './resource-base';
import { Entity } from './entity';
import { Tile } from './tile';
import { ResourceManager } from './resource-manager';
import { TileSchema } from '@/schemas/tile';
import { EntitySchema } from '@/schemas/entity';
import { Rect } from '@/utils/rect';
import { Size2d } from '@/types/engine';

export class Field extends ResourceBase<'field'> {
  static schema = FieldSchema;

  static async loadDeps(resources: ResourceManager, data: FieldData) {
    const tiles = Object.fromEntries(
      await Promise.all(
        Object.entries(data.tiles).map(async ([key, tileId]) => [
          key,
          await resources.get(tileId, TileSchema, Tile.factory),
        ])
      )
    );
    const entities = Object.fromEntries(
      await Promise.all(
        data.entities.map(async ({ instanceId, entityId, pos }) => [
          instanceId,
          await resources.get(entityId, EntitySchema, (resources, entityData) =>
            Entity.factory(resources, { instanceId, pos, entityData })
          ),
        ])
      )
    );

    return { tiles, entities };
  }

  currentImages(nowMs: number, view: Rect, blockSize: Size2d) {
    this.data.map.slice(view.top, view.bottom).map((row, ty) =>
      row.slice(view.left, view.right).map((symbol, tx) => ({
        pos: { x: (view.left + tx) * blockSize.width, y: (view.top + ty) * blockSize.height },
        image: this.deps.tiles.get(symbol)?.currentImage(nowMs),
      }))
    );
  }
}
