import type { ResourceType } from '@sharedTypes/resource/common';
import type { DatabaseInput } from '@sharedTypes/database/collection';
import { formatResourceId } from '@schema/resource/common/base';
import { getDocumentList } from '../api/hooks/search';
import { createDocument } from '../api/hooks/mutations';
import type { GraphicsResourceType } from './resource-type-meta';
import { allocateResourceName, resourceNameAllocatorCache } from './allocate-resource-name';

export type ReserveGraphicsResourceDraftParams<T extends GraphicsResourceType> = {
  namespace: string;
  type: T;
  parent?: string;
  hint?: string;
  data: Extract<DatabaseInput['resources'], { type: T }>['data'];
};

export async function fetchTakenResourceNames(params: {
  namespace: string;
  type: ResourceType;
  parent?: string;
}): Promise<Set<string>> {
  const names = new Set<string>();
  const query = [
    { name: 'namespace' as const, op: 'eq' as const, value: params.namespace },
    { name: 'type' as const, op: 'eq' as const, value: params.type },
  ];

  if (params.parent) {
    query.push({ name: 'name' as const, op: 'startsWith' as const, value: params.parent });
  }

  let cursor: string | undefined;
  do {
    const response = await getDocumentList('resources', { query, cursor });
    for (const item of response.items) {
      names.add(item.name);
    }
    cursor = response.hasMore ? response.nextCursor : undefined;
  } while (cursor != null);

  return names;
}

export async function reserveGraphicsResourceDraft<T extends GraphicsResourceType>(
  params: ReserveGraphicsResourceDraftParams<T>
): Promise<{ name: string; id: string }> {
  const { namespace, type, parent, hint, data } = params;
  const cacheKey = resourceNameAllocatorCache.key(namespace, type, parent);
  const taken = await fetchTakenResourceNames({ namespace, type, parent });
  let startIndex = resourceNameAllocatorCache.getStartIndex(cacheKey);

  for (let attempt = 0; attempt < 5; attempt++) {
    const { name, nextIndex } = allocateResourceName({ parent, taken, hint, startIndex });

    try {
      await createDocument('resources', {
        namespace,
        type,
        name,
        version: 0,
        isDraft: true,
        data,
      } as DatabaseInput['resources']);
      resourceNameAllocatorCache.setNextIndex(cacheKey, nextIndex);
      return { name, id: formatResourceId({ namespace, type, name }) };
    } catch (error) {
      taken.add(name);
      startIndex = 0;
      if (attempt === 4) throw error;
    }
  }

  throw new Error('Failed to reserve graphics resource name');
}
