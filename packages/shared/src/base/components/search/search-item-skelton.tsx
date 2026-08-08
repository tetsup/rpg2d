import { Skeleton } from '@base/components/ui/skeleton';
import { SearchResultItem } from './search-result-item';

export function SearchItemSkeleton() {
  return (
    <SearchResultItem>
      <Skeleton className="h-5 w-full rounded-sm" />
    </SearchResultItem>
  );
}
