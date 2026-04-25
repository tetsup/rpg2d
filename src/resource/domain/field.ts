import { FieldData, FieldDeps } from '@/schemas/field';
import { Rect } from '@/utils/rect';
import { Point2d, Size2d } from '@/types/engine';
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
        Object.values(data.entities).map(async ({ entityId }) => {
          const entity = (await ctx.resources.get(entityId, 'entity')) as Entity;
          return [entityId, entity];
        })
      )
    );
    return { tiles, entities };
  }

  get entityInstances() {
    return this.data.entities;
  }

  get entities() {
    return this.deps.entities;
  }

  checkReachable(dest: Point2d) {
    const tile = this.deps.tiles.get(this.data.map[dest.y][dest.x]);
    return tile?.allowOverwrap ?? false;
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
