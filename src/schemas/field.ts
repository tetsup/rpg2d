import z from 'zod';
import { IdSchema, ResourceSchemaBase, PositionSchema } from './common';

export const TileCodeSchema = z.string().min(1);
export type TileCode = z.infer<typeof TileCodeSchema>;

export const EntityMappingSchema = z.object({ instanceId: IdSchema, pos: PositionSchema, entityId: IdSchema });

export const FieldSchema = ResourceSchemaBase('field', {
  name: z.string(),
  tiles: z.record(TileCodeSchema, IdSchema),
  map: z.array(z.array(TileCodeSchema)),
  entities: z.array(EntityMappingSchema),
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
