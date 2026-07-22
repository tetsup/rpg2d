import { Skeleton } from '@base/components/ui/skeleton';

export function FormSkeleton() {
  return (
    <div className="space-y-6">
      {[0, 1].map((group) => (
        <div key={group} className="space-y-4">
          <Skeleton className="h-5 w-40" />

          <div className="space-y-4">
            {[0, 1, 2].map((field) => (
              <div key={field} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full rounded-md" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="flex gap-3 pt-4">
        <Skeleton className="h-10 w-24 rounded-md" />
        <Skeleton className="h-10 w-24 rounded-md" />
      </div>
    </div>
  );
}
