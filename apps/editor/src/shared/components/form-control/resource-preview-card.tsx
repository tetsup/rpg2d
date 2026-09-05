import { PreviewCard } from '@base/components/form-control/preview-card';
import { CardSkeleton } from '@base/components/form-control/card-skeleton';
import { ResourcePreview } from '@editor/feature/resource/preview/resource-preview';
import { resourceRepository } from '@editor/shared/repository/resource-repository';

type ResourcePreviewCardProps = {
  id: string;
  orient?: 'horizontal' | 'vertical';
};

export function ResourcePreviewCard({ orient, id }: ResourcePreviewCardProps) {
  const { data } = resourceRepository.useById(id);
  return data ? (
    <PreviewCard
      label={data.name}
      orient={orient}
      renderImage={() => <ResourcePreview resource={data} width={24} height={24} />}
    />
  ) : (
    <CardSkeleton orient={orient} />
  );
}
