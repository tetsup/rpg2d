import type { ResourceId, ResourceType } from '@sharedTypes/resource/common';

export type ResourceSummary = {
  id: ResourceId;
  type: ResourceType;
  name: string;
  description: string;
  readonly: boolean;
};

export type ResourceListResponse = {
  items: ResourceSummary[];
  nextCursor?: string;
  hasMore: boolean;
};
