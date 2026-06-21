import z from 'zod';

function unwrap<T>(schema: z.ZodType<T>): z.ZodType<T> {
  if (schema instanceof z.ZodOptional) return unwrap(schema.unwrap() as z.ZodType<T>);
  if (schema instanceof z.ZodNullable) return unwrap(schema.unwrap() as z.ZodType<T>);
  return schema;
}

function flattenMongoFilter(obj: Record<string, unknown>, prefix = '') {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      !Object.keys(value as object).some((k) => k.startsWith('$'))
    )
      Object.assign(result, flattenMongoFilter(value as Record<string, unknown>, path));
    else result[path] = value;
  }
  return result;
}

const stringFilterSchema = z
  .object({
    eq: z.string().optional(),
    ne: z.string().optional(),
    gt: z.string().optional(),
  })
  .strict()
  .refine((v) => Object.keys(v).length > 0, 'empty filter is not allowed')
  .transform((v) => {
    if (v.eq !== undefined) return v.eq;
    if (v.ne !== undefined) return { $ne: v.ne };
    if (v.gt !== undefined) return { $gt: v.gt };
    return undefined;
  });

const numberFilterSchema = z
  .object({
    eq: z.number().optional(),
    ne: z.number().optional(),
    gt: z.number().optional(),
    gte: z.number().optional(),
    lt: z.number().optional(),
    lte: z.number().optional(),
  })
  .strict()
  .refine((v) => Object.keys(v).length > 0, 'empty filter is not allowed')
  .transform((v) => {
    if (v.eq !== undefined) return v.eq;
    const result: Record<string, number> = {};
    if (v.ne !== undefined) result.$ne = v.ne;
    if (v.gt !== undefined) result.$gt = v.gt;
    if (v.gte !== undefined) result.$gte = v.gte;
    if (v.lt !== undefined) result.$lt = v.lt;
    if (v.lte !== undefined) result.$lte = v.lte;
    return Object.keys(result).length ? result : undefined;
  });

function createEnumFilterSchema(values: any[]) {
  const enumSchema = z.enum(values as [string, ...string[]]);
  return z
    .object({
      eq: enumSchema.optional(),
      ne: enumSchema.optional(),
    })
    .strict()
    .refine((v) => Object.keys(v).length > 0, 'empty filter is not allowed')
    .transform((v) => {
      if (v.eq !== undefined) return v.eq;
      if (v.ne !== undefined) return { $ne: v.ne };
      return undefined;
    });
}

function buildFilterShape(schema: z.ZodObject) {
  const shape: Record<keyof z.infer<typeof schema>, z.ZodTypeAny> = {};
  for (const [key, raw] of Object.entries(schema.shape)) {
    const field = unwrap(raw as z.ZodType);
    if (field instanceof z.ZodString) {
      shape[key] = stringFilterSchema.optional();
      continue;
    }
    if (field instanceof z.ZodNumber) {
      shape[key] = numberFilterSchema.optional();
      continue;
    }
    if (field instanceof z.ZodBoolean) {
      shape[key] = z.boolean().optional();
      continue;
    }
    if (field instanceof z.ZodEnum) {
      shape[key] = createEnumFilterSchema(field.options).optional();
      continue;
    }
    if (field instanceof z.ZodObject) {
      shape[key] = z.object(buildFilterShape(field)).strict().optional();
    }
  }
  return shape;
}

export function createFilterSchema<T extends z.ZodObject>(documentSchema: T) {
  const shape = buildFilterShape(documentSchema);
  return z
    .object({
      q: z.string().trim().max(100).optional(),
      ...shape,
    })
    .strict()
    .transform((input) => {
      const result: Record<string, unknown> = {};
      if (input.q) result.$text = { $search: input.q };
      const { q, ...rest } = input;
      Object.assign(result, flattenMongoFilter(rest as Record<string, unknown>));
      return result;
    });
}
