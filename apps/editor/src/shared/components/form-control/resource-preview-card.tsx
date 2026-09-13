import { ReactNode } from 'react';
import { CircleX } from 'lucide-react';
import { ResourceData } from '@sharedTypes/resource/common';
import { CanvasSkeleton } from '@base/components/canvas/canvas-skeleton';
import { PreviewCard } from '@base/components/form-control/preview-card';
import { resourceRepository } from '@editor/shared/repository/resource-repository';
import { ResourcePreview } from '@editor/feature/resource/preview/resource-preview';

type ResourcePreviewCardProps = {
  id: string;
  label?: (data: ResourceData<any>) => ReactNode;
  orient?: 'horizontal' | 'vertical';
};

export function ResourcePreviewCard({
  id,
  label = (data) => data.name,
  orient = 'vertical',
}: ResourcePreviewCardProps) {
  const { data, isLoading, isSuccess } = resourceRepository.useById(id);
  return (
    <PreviewCard
      label={data ? label(data) : ''}
      orient={orient}
      renderImage={() =>
        isSuccess ? (
          <ResourcePreview resource={data} width={24} height={24} />
        ) : isLoading ? (
          <CanvasSkeleton width={24} height={24} />
        ) : (
          <CircleX size={24} />
        )
      }
    />
  );
}
