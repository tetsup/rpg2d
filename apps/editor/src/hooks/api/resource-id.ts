import type { ResourcePath } from '@sharedTypes/resource/common';
import { splitId } from '@schema/resource/common/base';

export function parseResourceId(id: string): ResourcePath {
  return splitId.parse(id);
}

export function buildResourceId(path: ResourcePath): string {
  return `${path.namespace}/${path.type}/${path.name}`;
}

export function toResourceApiPath(id: string): string {
  const path = parseResourceId(id);
  return `/api/resources/${path.namespace}/${path.type}/${path.name}`;
}

export function isResourceCollection(collection: string): collection is 'resources' {
  return collection === 'resources';
}
