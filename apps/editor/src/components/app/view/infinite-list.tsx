import { ReactNode, useEffect, useMemo, useRef } from 'react';
import type { InfiniteData } from '@tanstack/react-query';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useInView } from 'react-intersection-observer';

type InfiniteListPage<T> = {
  items: T[];
};

type InfiniteListProps<T> = {
  data?: InfiniteData<InfiniteListPage<T>> | undefined;
  fetchNextPage: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage: boolean;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  estimateSize: number;
  renderItem: (item: T, index: number) => ReactNode;
  empty?: ReactNode | undefined;
  loading?: ReactNode | undefined;
};

export function InfiniteList<T>({
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  isLoading,
  isError,
  error,
  estimateSize,
  renderItem,
  empty,
  loading,
}: InfiniteListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);
  const { ref, inView } = useInView({
    rootMargin: '1000px',
  });
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);
  const items = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data]);
  const virtualizer = useVirtualizer({
    count: items.length + (hasNextPage ? 1 : 0),
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan: 8,
  });

  if (isLoading) {
    return <>{loading ?? <div className="p-4">Loading...</div>}</>;
  }

  if (isError) {
    return (
      <div
        className="
          p-4
          text-sm
          text-destructive
        "
      >
        {error?.message ?? 'Unknown error'}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <>
        {empty ?? (
          <div
            className="
              p-4
              text-sm
              text-muted-foreground
            "
          >
            No items
          </div>
        )}
      </>
    );
  }

  return (
    <div id="list-scroll" ref={parentRef} className="h-full overflow-auto">
      <div
        style={{
          height: virtualizer.getTotalSize(),
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const isLoader = virtualItem.index >= items.length;
          const item = items[virtualItem.index];
          return (
            <div
              key={virtualItem.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <div className="p-2" ref={isLoader ? ref : undefined}>
                {isLoader ? (
                  hasNextPage ? (
                    <div
                      className="
                            flex
                            h-20
                            items-center
                            justify-center
                            text-sm
                            text-muted-foreground
                          "
                    >
                      Loading more...
                    </div>
                  ) : (
                    <div
                      className="
                            flex
                            h-20
                            items-center
                            justify-center
                            text-sm
                            text-muted-foreground
                          "
                    >
                      End
                    </div>
                  )
                ) : (
                  renderItem(item, virtualItem.index)
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
