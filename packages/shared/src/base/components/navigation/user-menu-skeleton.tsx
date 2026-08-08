import { Skeleton } from '@base/components/ui/skeleton';

export function UserMenuSkeleton() {
  return (
    <div className="flex items-center gap-2 rounded-md border px-2 py-1">
      <Skeleton className="h-7 w-7 rounded-none" />

      <div className="space-y-1">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-2 w-28" />
      </div>
    </div>
  );
}
