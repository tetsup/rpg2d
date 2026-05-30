import type { ResourcePath } from '@sharedTypes/resource/common';
import { IdSchema } from '@schema/resource/common/base';
import type { resolveResourceSchema } from '@schema/resource/common/resolver';

export function buildDocument(path: ResourcePath, data: object, schema: typeof resolveResourceSchema) {
  const parsed = schema(path.type).parse(data);

  return {
    ...path,
    data: parsed,
  };
}

export function buildId(path: ResourcePath) {
  return `${path.namespace}/${path.type}/${path.name}`;
}

export function extractResourceRefs(value: unknown): string[] {
  const refs = new Set<string>();

  function walk(current: unknown) {
    if (typeof current === 'string' && IdSchema.safeParse(current).success) {
      refs.add(current);
      return;
    }

    if (Array.isArray(current)) {
      current.forEach(walk);
      return;
    }

    if (current && typeof current === 'object') {
      Object.entries(current)
        .filter(([key, _]) => key !== 'id')
        .forEach(([_, value]) => walk(value));
    }
  }
  walk(value);
  return [...refs];
}
