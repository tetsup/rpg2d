import { z } from 'zod';

function withNull<T extends z.ZodTypeAny>(schema: T): z.ZodUnion<[T, z.ZodNull]> {
  return z.union([schema, z.null()]);
}

function deepNullableInternal(schema: z.ZodTypeAny): z.ZodTypeAny {
  if (schema instanceof z.ZodOptional) {
    return deepNullableInternal(schema.unwrap()).optional();
  }

  if (schema instanceof z.ZodNullable) {
    return deepNullableInternal(schema.unwrap()).nullable();
  }

  if (schema instanceof z.ZodDefault) {
    return deepNullableInternal(schema.unwrap()).default(schema.def.defaultValue);
  }

  if (schema instanceof z.ZodPrefault) {
    return deepNullableInternal(schema.def.innerType).prefault(schema.def.defaultValue);
  }

  if (schema instanceof z.ZodCatch) {
    return deepNullableInternal(schema.def.innerType).catch(schema.def.catchValue);
  }

  if (schema instanceof z.ZodNonOptional) {
    return deepNullableInternal(schema.def.innerType).nonoptional();
  }

  if (schema instanceof z.ZodReadonly) {
    return deepNullableInternal(schema.def.innerType).readonly();
  }

  if (schema instanceof z.ZodObject) {
    const shape = schema.shape;
    const newShape: Record<string, z.ZodTypeAny> = {};

    for (const key in shape) {
      newShape[key] = deepNullableInternal(shape[key]);
    }

    return z.object(newShape);
  }

  if (schema instanceof z.ZodArray) {
    return z.array(deepNullableInternal(schema.def.element));
  }

  if (schema instanceof z.ZodRecord) {
    return z.record(deepNullableInternal(schema.def.keyType), deepNullableInternal(schema.def.valueType));
  }

  if (schema instanceof z.ZodTuple) {
    return z.tuple(schema.def.items.map((item) => deepNullableInternal(item)) as [z.ZodTypeAny, ...z.ZodTypeAny[]]);
  }

  if (schema instanceof z.ZodMap) {
    return z.map(deepNullableInternal(schema.def.keyType), deepNullableInternal(schema.def.valueType));
  }

  if (schema instanceof z.ZodSet) {
    return z.set(deepNullableInternal(schema.def.valueType));
  }

  if (schema instanceof z.ZodPromise) {
    return z.promise(deepNullableInternal(schema.def.innerType));
  }

  if (schema instanceof z.ZodUnion) {
    return z.union(schema.options.map((option) => deepNullableInternal(option)));
  }

  if (schema instanceof z.ZodDiscriminatedUnion) {
    return z.discriminatedUnion(
      schema.def.discriminator,
      schema.options.map((option) => deepNullableInternal(option))
    );
  }

  if (schema instanceof z.ZodIntersection) {
    return z.intersection(deepNullableInternal(schema.def.left), deepNullableInternal(schema.def.right));
  }

  if (schema instanceof z.ZodLazy) {
    return z.lazy(() => deepNullableInternal(schema.def.getter()));
  }

  if (schema instanceof z.ZodPipe) {
    return deepNullableInternal(schema.in);
  }

  return withNull(schema);
}

/**
 * Recursively allows `null` on leaf values while preserving object key shapes.
 * Optional wrappers stay optional; required keys remain required.
 */
export function deepNullable<T extends z.ZodTypeAny>(schema: T): z.ZodTypeAny {
  return deepNullableInternal(schema);
}
