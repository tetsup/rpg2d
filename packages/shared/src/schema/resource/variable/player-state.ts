import z from 'zod';
import type { StateDefinition } from '@sharedTypes/variable';
import { buildValueSchema, isValueDefinition } from './definition';

export function buildStateSchema<T extends StateDefinition = any>(def: T) {
  if (isValueDefinition(def)) return buildValueSchema(def);

  const shape: Record<string, z.ZodTypeAny> = {};
  for (const key in def) {
    shape[key] = buildStateSchema(def[key] as StateDefinition);
  }
  return z.object(shape);
}
