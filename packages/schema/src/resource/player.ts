import z from 'zod';
import type { StateDefinition } from '@sharedTypes/variable';
import { IdSchema, IdSchemaFromType } from './common/base';
import { buildStateSchema } from './variable/player-state';

export const NameSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('fixed'),
    value: z.string(),
  }),
  z.object({
    type: z.literal('input'),
    input: z.object({
      default: z.string().optional(),
      maxLength: z.number().optional(),
      regex: z.string().optional(),
    }),
  }),
  z.object({
    type: z.literal('reference'),
    ref: z.string(),
  }),
]);

export function buildPlayerSchema<T extends StateDefinition = any>(def: T) {
  return z.object({
    id: IdSchemaFromType('player'),
    name: NameSchema,
    initialSkin: IdSchema,
    initialState: buildStateSchema(def),
  });
}

export const PlayerSchema = buildPlayerSchema({}).extend({
  initialState: z.record(z.string(), z.unknown()).optional().nullish(),
});
