import z from 'zod';
import type { Direction2d, Point2d } from '@/types/engine';
import type { Tile } from '@/resource/domain/tile';
import type { Entity } from '@/resource/domain/entity';
import { IdSchema, ResourceSchemaBase, PositionSchema, DirectionSchema } from './common';

export const TileCodeSchema = z.string().min(1);
export type TileCode = z.infer<typeof TileCodeSchema>;

export const EntityInitialStateSchema = z.object({
  pos: PositionSchema,
  direction: DirectionSchema,
  visible: z.boolean(),
});

export type EntityInitialState = z.infer<typeof EntityInitialStateSchema>;

export const EntityMappingSchema = z.record(
  IdSchema,
  z.object({ entityId: IdSchema, initialState: EntityInitialStateSchema })
);

export const FieldSchema = ResourceSchemaBase('field', {
  name: z.string(),
  tiles: z.record(TileCodeSchema, IdSchema),
  map: z.array(z.array(TileCodeSchema)),
  entities: EntityMappingSchema,
}).superRefine((data, ctx) => {
  const tileKeys = new Set(Object.keys(data.tiles));

  data.map.forEach((row, y) => {
    row.forEach((tileCode, x) => {
      if (!tileKeys.has(tileCode)) {
        ctx.addIssue({
          code: 'custom',
          message: `map[${y}][${x}] の "${tileCode}" は tilesのキーに存在しません`,
          path: ['map', y, x],
        });
      }
    });
  });
});

export type FieldData = z.infer<typeof FieldSchema>;

export type FieldDeps = {
  tiles: Map<string, Tile>;
  entities: Map<string, Entity>;
};
