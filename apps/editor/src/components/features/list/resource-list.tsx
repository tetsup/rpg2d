import type { ResourceType } from '@sharedTypes/resource/common';
import { useResourceList } from '@editor/hooks/api/resource-list';
import { InfiniteList } from '@editor/components/app/view/infinite-list';
import { ResourceItem } from './resource-item';

type ResourceListProps = {
  query: string;
  type?: ResourceType;
};

export function ResourceList({ query, type }: ResourceListProps) {
  const resources = useResourceList({
    query,
    type,
  });

  return <InfiniteList {...resources} estimateSize={88} renderItem={(item) => <ResourceItem summary={item} />} />;
}
