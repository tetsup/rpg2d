import z from 'zod';
import { IdSchema, ResourceSchemaBase } from './common/base';
import { PositionSchema, DirectionSchema } from './common/coordinate';

export const TileCodeSchema = z.string().min(1);

export const EntityInitialStateSchema = z.object({
  pos: PositionSchema,
  direction: DirectionSchema,
  visible: z.boolean(),
});

export const EntityMappingSchema = z.record(
  IdSchema,
  z.object({ entityId: IdSchema, initialState: EntityInitialStateSchema })
);

export const FieldSchema = ResourceSchemaBase('field', {
  name: z.string(),
  tiles: z.record(TileCodeSchema, IdSchema),
  map: z.array(z.array(TileCodeSchema)),
  entities: EntityMappingSchema.optional(),
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
