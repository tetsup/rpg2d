import { FieldData, FieldDeps } from '@/schemas/field';
import { Rect } from '@/utils/rect';
import { Size2d } from '@/types/engine';
import { ResourceBase } from '../core/resource-base';
import { GameContext } from '../core/game-context';
import { Entity } from './entity';

export class Field extends ResourceBase<'field'> {
  static async loadDeps(ctx: GameContext, data: FieldData): Promise<FieldDeps> {
    const tiles = Object.fromEntries(
      await Promise.all(
        Object.entries(data.tiles).map(async ([key, tileId]) => [key, await ctx.resources.get(tileId, 'tile')])
      )
    );
    const entities = Object.fromEntries(
      await Promise.all(
        Object.entries(data.entities).map(async ([instanceId, { entityId, pos, direction }]) => {
          const entity = (await ctx.resources.get(entityId, 'entity')) as Entity;
          entity.jump(pos, direction);
          return [instanceId, entity];
        })
      )
    );
    return { tiles, entities };
  }

  resolveLayers(nowMs: number, view: Rect, blockSize: Size2d) {
    this.data.map.slice(view.top, view.bottom).map((row, ty) =>
      row.slice(view.left, view.right).map((symbol, tx) => ({
        pos: { x: (view.left + tx) * blockSize.width, y: (view.top + ty) * blockSize.height },
        layers: this.deps.tiles.get(symbol)?.resolveLayers(nowMs),
      }))
    );
  }
}
