import z from 'zod';
import { IdSchema, ResourceSchemaBase } from './common';
import { type StateDefinition, buildStateSchema } from './playerState';
import { Skin } from '@/resource/domain/skin';

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
  return ResourceSchemaBase('player', {
    name: NameSchema,
    initialSkin: IdSchema,
    initialState: buildStateSchema(def),
  });
}

export type PlayerData<T extends StateDefinition = any> = z.infer<ReturnType<typeof buildPlayerSchema<T>>>;

export type PlayerDeps = {
  initialSkin: Skin;
};
