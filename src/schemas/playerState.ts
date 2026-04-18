import z from 'zod';

type NumberDefinition = {
  type: 'number';
  min?: number;
  max?: number;
  asInt: boolean;
  optional?: false;
};

type OptionalNumberDefinition = {
  type: 'number';
  min?: number;
  max?: number;
  asInt: boolean;
  optional: true;
};

type StringDefinition = {
  type: 'string';
  min?: number;
  max?: number;
  optional?: false;
};

type OptionalStringDefinition = {
  type: 'string';
  min?: number;
  max?: number;
  optional: true;
};

export type ValueDefinition = NumberDefinition | OptionalNumberDefinition | StringDefinition | OptionalStringDefinition;

const ValueDefinitionSchema: z.ZodType<ValueDefinition> = z.discriminatedUnion('type', [
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

type ValueTypeFromDefinition<T> = T extends OptionalNumberDefinition
  ? number | undefined
  : T extends NumberDefinition
    ? number
    : T extends OptionalStringDefinition
      ? string | undefined
      : T extends StringDefinition
        ? string
        : never;

type StateFromDefinition<T> = T extends { type: string }
  ? ValueTypeFromDefinition<T>
  : T extends Record<string, any>
    ? { [K in keyof T]: StateFromDefinition<T[K]> }
    : never;

export type StateDefinition = ValueDefinition | { [key: string]: StateDefinition };

export const StateDefinitionSchema: z.ZodType<StateDefinition> = z.lazy(() =>
  z.record(z.string(), z.union([ValueDefinitionSchema, StateDefinitionSchema]))
);

function isValueDefinition(def: StateDefinition): def is z.infer<typeof ValueDefinitionSchema> {
  return typeof def === 'object' && def !== null && 'type' in def;
}

function buildValueSchema<T extends ValueDefinition>(def: T): z.ZodType<ValueTypeFromDefinition<T>> {
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

export function buildStateSchema<T extends StateDefinition = any>(def: T) {
  if (isValueDefinition(def)) return buildValueSchema(def);

  const shape: Record<string, z.ZodTypeAny> = {};
  for (const key in def) {
    shape[key] = buildStateSchema(def[key] as StateDefinition);
  }
  return z.object(shape).strict();
}
