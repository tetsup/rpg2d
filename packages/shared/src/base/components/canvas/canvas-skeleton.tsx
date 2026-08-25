import { Skeleton } from '@base/components/ui/skeleton';

type CanvasSkeletonProps = {
  width: number;
  height: number;
  rounded?: boolean;
};

export function CanvasSkeleton({ width, height, rounded = false }: CanvasSkeletonProps) {
  return <Skeleton className={`h-${height} w-${width} ${!rounded ? 'rounded-none' : ''}`} />;
}
