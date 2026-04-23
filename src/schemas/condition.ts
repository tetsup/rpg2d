import z from 'zod';
import { IdSchema, PrimitiveValueSchema } from './common';

export const ValueDefinitionSchema = z.discriminatedUnion('type', [
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

export function buildValueSchema(
  def: z.infer<typeof ValueDefinitionSchema>
): z.ZodOptional<z.ZodNumber | z.ZodString> | z.ZodNumber | z.ZodString {
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
  return def.optional ? schema.optional() : schema;
}

const OperatorSchema = z.enum(['==', '!=', '<', '<=', '>', '>=']);

export const SingleConditionSchema = z
  .object({
    path: IdSchema,
    operator: OperatorSchema,
    value: PrimitiveValueSchema,
  })
  .superRefine((val, ctx) => {
    if (['<', '<=', '>', '>='].includes(val.operator) && typeof val.value !== 'number') {
      ctx.addIssue({
        code: 'custom',
        message: '数値比較にはnumberが必要です',
      });
    }
  });

export const ConditionSchema: z.ZodType<any> = z.lazy(() =>
  z.union([
    SingleConditionSchema,
    z.object({ all: z.array(ConditionSchema) }),
    z.object({ any: z.array(ConditionSchema) }),
  ])
);

export type Condition = z.infer<typeof ConditionSchema>;
