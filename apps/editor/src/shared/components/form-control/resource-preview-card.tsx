import { PreviewCard } from '@base/components/form-control/preview-card';
import { ResourcePreview } from '@editor/feature/resource/preview/resource-preview';
import { resourceRepository } from '@editor/shared/repository/resource-repository';

type ResourcePreviewCardProps = {
  id: string;
};

export function ResourcePreviewCard({ id }: ResourcePreviewCardProps) {
  const { data } = resourceRepository.useById(id);
  return (
    data && (
      <PreviewCard label={data.name} renderImage={() => <ResourcePreview resource={data} width={24} height={24} />} />
    )
  );
}
