import { PreviewCard } from '@base/components/form-control/preview-card';
import { SearchItemSkeleton } from '@base/components/search/search-item-skelton';
import { resourceRepository } from '@editor/shared/repository/resource-repository';
import { FileQuestionMark } from 'lucide-react';

type ResourceItemProps = {
  id: string;
  renderImage?: (id: string) => React.ReactNode;
};

export function ResourceItem({ id, renderImage }: ResourceItemProps) {
  const res = resourceRepository.useById(id);
  return res.isSuccess ? (
    <PreviewCard label={res.data.id} renderImage={renderImage ? () => renderImage(id) : () => <FileQuestionMark />} />
  ) : (
    <SearchItemSkeleton />
  );
}
