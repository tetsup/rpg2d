import { IdSchema } from '@schema/resource/common/base';

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
