import z from 'zod';
import type { StateDefinition, ValueDefinition, ValueTypeFromDefinition } from '../../../../../types/variable';

export const ValueDefinitionSchema: z.ZodType<ValueDefinition> = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('number'),
    min: z.number().optional(),
    max: z.number().optional(),
    asInt: z.boolean(),
    optional: z.boolean().default(false),
  }),
  z.object({
    type: z.literal('string'),
    min: z.number().int().min(0).default(0),
    max: z.number().int().optional(),
    optional: z.boolean().default(false),
  }),
]);

export const StateDefinitionSchema: z.ZodType<StateDefinition> = z.lazy(() =>
  z.record(z.string(), z.union([ValueDefinitionSchema, StateDefinitionSchema]))
);

export function isValueDefinition(def: StateDefinition): def is z.infer<typeof ValueDefinitionSchema> {
  return typeof def === 'object' && def !== null && 'type' in def;
}

export function buildValueSchema<T extends ValueDefinition>(def: T): z.ZodType<ValueTypeFromDefinition<T>> {
  let schema;
  switch (def.type) {
    case 'number':
      schema = z.number();
      if (def.asInt) schema = schema.int();
      if (def.min !== undefined) schema = schema.min(def.min);
      if (def.max !== undefined) schema = schema.max(def.max);
      break;
    case 'string':
      schema = z.string();
      if (def.min !== undefined) schema = schema.min(def.min);
      if (def.max !== undefined) schema = schema.max(def.max);
      break;
  }
  return (def.optional ? schema.optional() : schema) as unknown as z.ZodType<ValueTypeFromDefinition<T>>;
}
