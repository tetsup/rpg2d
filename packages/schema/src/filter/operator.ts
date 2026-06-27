import z from 'zod';

export const BTreeStringOps = z.enum(['eq', 'ne', 'in', 'startsWith']);

export const BTreeNumberOps = z.enum(['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'in', 'between']);

export const BTreeDateOps = z.enum(['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'between']);

export const TrgmOps = z.enum(['contains', 'startsWith', 'endsWith', 'ilike']);

export const JsonOps = z.enum([
  'contains', // @>
  'containedBy', // <@
  'hasKey', // ?
  'hasAny', // ?|
  'hasAll', // ?&
]);

export const FullTextOps = z.enum([
  'match', // @@
  'rank', // ts_rank
]);

export const BooleanOps = z.enum(['eq', 'ne']);
