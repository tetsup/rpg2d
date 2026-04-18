import z from 'zod';
import { AppearanceSchema } from './appearance';
import { type StateDefinition, buildStateSchema } from './playerState';

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
    id: z.string(),
    name: NameSchema,
    appearance: AppearanceSchema,
    state: buildStateSchema(def),
  });
}

export type PlayerData<T extends StateDefinition = any> = z.infer<ReturnType<typeof buildPlayerSchema<T>>>;
