import { Skeleton } from '../ui/skeleton';
import { PreviewCard } from './preview-card';

type CardSkeletonProps = {
  orient?: 'horizontal' | 'vertical';
  className?: string;
};

export function CardSkeleton({ orient = 'vertical', className }: CardSkeletonProps) {
  return (
    <PreviewCard
      orient={orient}
      className={className}
      label={<Skeleton className="mx-auto h-3 w-2/3" />}
      renderImage={() => <Skeleton className="h-3/4 w-3/4" />}
    />
  );
}
