import type { FieldData, FieldDeps } from '@/schemas/field';
import { Rect } from '@/utils/rect';
import type { LayerWithPos, Point2d } from '@/types/engine';
import { ResourceBase } from '../core/resource-base';
import type { GameContext } from '../core/game-context';
import type { Tile } from './tile';
import type { Entity } from './entity';

export class Field extends ResourceBase<'field'> {
  static async loadDeps(ctx: GameContext, data: FieldData): Promise<FieldDeps> {
    const tiles = new Map(
      await Promise.all(
        Object.entries(data.tiles).map(
          async ([key, tileId]): Promise<[string, Tile]> => [key, await ctx.resources.get(tileId, 'tile')]
        )
      )
    );
    const entities = new Map(
      await Promise.all(
        Object.values(data.entities ?? []).map(async ({ entityId }): Promise<[string, Entity]> => {
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

  resolveLayers = (nowMs: number, viewport: Rect): LayerWithPos[] => {
    const blockSize = this.ctx.manifest.config.blockSize;
    const tileMask = {
      xMin: Math.max(0, Math.floor(viewport.left / blockSize.width)),
      xMax: Math.floor(viewport.right + 1 / blockSize.width),
      yMin: Math.max(0, Math.floor(viewport.top / blockSize.height)),
      yMax: Math.floor(viewport.bottom + 1 / blockSize.height),
    };

    return this.data.map.slice(tileMask.yMin, tileMask.yMax).flatMap((row, iy) =>
      row
        .slice(tileMask.xMin, tileMask.xMax)
        .map((symbol, ix) => ({
          rect: new Rect(
            (ix + tileMask.xMin) * blockSize.width,
            (iy + tileMask.yMin) * blockSize.height,
            blockSize.width,
            blockSize.height
          ).relational(viewport.topLeft),
          layers: this.deps.tiles.get(symbol)?.resolveLayers(nowMs) ?? [],
        }))
        .flatMap((row) => row.layers.map((layer) => ({ rect: row.rect, layer })))
    );
  };
}
