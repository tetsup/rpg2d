import { useEffect, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useInView } from 'react-intersection-observer';
import type { FilterMap } from '@sharedTypes/database/filter';
import { SearchResult } from '@base/components/search/search-result';
import { SearchResultItem } from '@base/components/search/search-result-item';
import { SearchResultEmpty } from '@base/components/search/search-result-empty';
import { SearchItemSkeleton } from '@base/components/search/search-item-skelton';
import { createRepository } from '@editor/shared/repository/factory';

export type InfiniteListProps<T extends keyof FilterMap> = {
  query: FilterMap[T][];
  renderItem(id: string): ReactNode;
  onSelect(id: string): void;
  useInfiniteSearch: ReturnType<typeof createRepository<T>>['useInfiniteSearch'];
  size?: 'full' | 'sm' | 'md' | 'lg';
};

export function InfiniteList<T extends keyof FilterMap>({
  query,
  renderItem,
  onSelect,
  useInfiniteSearch,
  size = 'full',
}: InfiniteListProps<T>) {
  const { t } = useTranslation();
  const { ref, inView } = useInView();
  const { data, hasNextPage, isLoading, fetchNextPage } = useInfiniteSearch(query);

  useEffect(() => {
    if (inView && hasNextPage && !isLoading) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isLoading, fetchNextPage]);

  return isLoading ? (
    <SearchItemSkeleton />
  ) : data?.pages.every((page) => page.items.length === 0) ? (
    <SearchResultEmpty>{t('検索結果が0件でした')}</SearchResultEmpty>
  ) : (
    <SearchResult size={size}>
      {data?.pages.map((pages, pageIndex) =>
        pages.items.map((item, itemIndex) => (
          <SearchResultItem key={`${pageIndex}-${itemIndex}`} onClick={() => onSelect(item.id)}>
            {renderItem(item.id)}
          </SearchResultItem>
        ))
      )}

      {hasNextPage && (
        <>
          <div ref={ref} />
          <SearchItemSkeleton />
        </>
      )}
    </SearchResult>
  );
}
