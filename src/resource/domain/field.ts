import { FieldData, FieldDeps } from '@/schemas/field';
import { Rect } from '@/utils/rect';
import { LayerWithPos, Point2d } from '@/types/engine';
import { ResourceBase } from '../core/resource-base';
import { GameContext } from '../core/game-context';

export class Field extends ResourceBase<'field'> {
  static async loadDeps(ctx: GameContext, data: FieldData): Promise<FieldDeps> {
    const tiles = Object.fromEntries(
      await Promise.all(
        Object.entries(data.tiles).map(async ([key, tileId]) => [key, await ctx.resources.get(tileId, 'tile')])
      )
    );
    const entities = Object.fromEntries(
      await Promise.all(
        Object.values(data.entities ?? []).map(async ({ entityId }) => {
          const entity = await ctx.resources.get(entityId, 'entity');
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

  checkReachable = (dest: Point2d) => {
    const tile = this.deps.tiles.get(this.data.map[dest.y][dest.x]);
    return tile?.allowOverwrap ?? false;
  };

  resolveLayers = (nowMs: number, view: Rect): LayerWithPos[] => {
    return this.data.map.slice(view.top, view.bottom).flatMap((row, ty) =>
      row
        .slice(view.left, view.right)
        .map((symbol, tx) => ({
          rect: new Rect(
            (view.left + tx) * this.ctx.manifest.config.blockSize.width,
            (view.top + ty) * this.ctx.manifest.config.blockSize.height,
            this.ctx.manifest.config.blockSize.width,
            this.ctx.manifest.config.blockSize.height
          ),
          layers: this.deps.tiles.get(symbol)?.resolveLayers(nowMs) ?? [],
        }))
        .flatMap((row) => row.layers.map((layer) => ({ rect: row.rect, layer })))
    );
  };
}
