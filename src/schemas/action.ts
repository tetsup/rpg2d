import z from 'zod';
import { ResourceSchemaBase } from './common';

export const ValueTypeVariableSchema = z.literal('variable');
export const ValueTypeConstSchema = z.literal('const');
export const ValueTypeOperationSchema = z.literal('operation');
export const VariableIdSchema = z.string(); //暫定

export const ValueSchema = z.union([
  z.object({ type: ValueTypeVariableSchema, value: VariableIdSchema }),
  z.object({ type: ValueTypeConstSchema, value: z.number() }),
  z.object({
    type: ValueTypeOperationSchema,
    get value() {
      return OperationSchema;
    },
  }),
]);

export const SingleOperationSchema = z.object({ op: z.enum(['~']), value: ValueSchema });

export const BinaryOperationSchema = z.object({
  op: z.enum(['/', '//', '%', '^']),
  values: z.array(ValueSchema).length(2),
});

export const MultipleOperationSchema = z.object({
  op: z.enum(['+', '-', '*', '&', '|']),
  values: z.array(ValueSchema).min(2),
});

export const OperationSchema = z.union([SingleOperationSchema, BinaryOperationSchema, MultipleOperationSchema]);

export const ComparisonSchema = z.object({
  cmp: z.enum(['lt', 'gt', 'eq', 'lte', 'gte']),
  left: OperationSchema,
  right: OperationSchema,
});

export const BooleanAggregationSchema = z.object({ agg: z.enum(['and', 'or']), elements: z.array(ComparisonSchema) });

export const ActionSchema = ResourceSchemaBase('action', {});

export type ActionData = z.infer<typeof ActionSchema>;

export type ActionDeps = {};
