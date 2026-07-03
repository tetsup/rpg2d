import { parseResourceId } from '@schema/resource/common/base';

export function toResourceApiPath(id: string): string {
  const path = parseResourceId.parse(id);
  return `/api/resources/${path.namespace}/${path.type}/${path.name}`;
}

export function isResourceCollection(collection: string): collection is 'resources' {
  return collection === 'resources';
}
