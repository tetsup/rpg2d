import { ResourceType } from '@sharedTypes/resource/common';
import { ResourceListResponse } from '@editor/types/resources';
import { fetchGetApi } from './fetch-get';

type Params = {
  query: string;
  type?: ResourceType;
  cursor?: string;
};

export async function getResourceList({ query, type, cursor }: Params) {
  return fetchGetApi<ResourceListResponse>('/api/resources', {
    q: query,
    type,
    cursor,
    limit: '40',
  });
}
