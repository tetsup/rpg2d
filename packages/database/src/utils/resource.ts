import type { ResourcePath } from '@sharedTypes/resource/common';
import type { ResourceMeta } from '@sharedTypes/database/collection';
import { IdSchema } from '@schema/resource/common/base';
import type { createResourceDocumentSchema } from '@schema/database/resource';

export function buildDocument(metadata: ResourceMeta, data: object, schema: typeof createResourceDocumentSchema) {
  return schema(metadata.type).parse({ ...metadata, data });
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
