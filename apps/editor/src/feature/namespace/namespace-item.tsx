import { FolderOpen } from 'lucide-react';
import { PreviewCard } from '@base/components/form-control/preview-card';
import { CardSkeleton } from '@base/components/form-control/card-skeleton';
import { namespaceRepository } from '@editor/shared/repository/namespace-repository';

type NamespaceItemProps = {
  id: string;
};

export function NamespaceItem({ id }: NamespaceItemProps) {
  const res = namespaceRepository.useById(id);
  return res.isSuccess ? (
    <PreviewCard orient="horizontal" label={res.data.id} renderImage={() => <FolderOpen />} />
  ) : (
    <CardSkeleton orient="horizontal" />
  );
}
