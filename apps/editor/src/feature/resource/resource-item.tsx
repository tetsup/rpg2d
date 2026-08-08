import { ListItem } from '@base/components/form-control/list-item';
import { SearchItemSkeleton } from '@base/components/search/search-item-skelton';
import { resourceRepository } from '@editor/shared/repository/resource-repository';

type ResourceItemProps = {
  id: string;
};

export function ResourceItem({ id }: ResourceItemProps) {
  const res = resourceRepository.useById(id);
  return res.isSuccess ? <ListItem itemLabel={res.data.id} /> : <SearchItemSkeleton />;
}
