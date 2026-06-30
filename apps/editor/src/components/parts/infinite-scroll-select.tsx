import { useEffect, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useInView } from 'react-intersection-observer';
import { Database } from '@sharedTypes/database/collection';
import { useDocumentList } from '@editor/hooks/api/search';
import { buildRenderItemContext, type RenderItemContext } from '@editor/lib/document-item';
import { Command, CommandEmpty, CommandGroup, CommandItem } from '../ui/command';
import { FilterMap } from '@sharedTypes/database/filter';

function defaultRenderItem<T>(_item: T, { label, thumbnail }: RenderItemContext) {
  if (!thumbnail) return label;

  return (
    <span className="flex min-w-0 items-center gap-2">
      <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-muted">
        {thumbnail}
      </span>
      <span className="truncate">{label}</span>
    </span>
  );
}

type InfiniteScrollSelectProps<T extends keyof FilterMap> = {
  collectionName: T;
  onItemSelect: (item: Database[T]) => void;
  query: FilterMap[T][];
  renderItem?: (item: Database[T], ctx: RenderItemContext) => ReactNode;
};

export function InfiniteScrollSelect<T extends keyof FilterMap>({
  collectionName,
  onItemSelect,
  query,
  renderItem = defaultRenderItem,
}: InfiniteScrollSelectProps<T>) {
  const { t } = useTranslation();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useDocumentList({ collectionName, query });
  const { ref, inView } = useInView();
  useEffect(() => {
    if (inView && hasNextPage) fetchNextPage();
  }, [inView, hasNextPage, fetchNextPage]);
  const allItems = data?.pages.flatMap((page) => page.items) || [];

  return (
    <Command shouldFilter={false}>
      <CommandEmpty>
        <div className="p-4 text-sm text-muted-foreground">{t('見つかりませんでした')}</div>
      </CommandEmpty>
      <CommandGroup>
        {allItems.map((item, index) => {
          const ctx = buildRenderItemContext(collectionName, item);
          return (
            <CommandItem key={index} onSelect={() => onItemSelect(item)}>
              {renderItem(item, ctx)}
            </CommandItem>
          );
        })}
        <CommandItem ref={ref}>
          {isFetchingNextPage
            ? `${t('読み込み中')}...`
            : hasNextPage
              ? t('さらに読み込む')
              : t('すべてのデータを読み込みました')}
        </CommandItem>
      </CommandGroup>
    </Command>
  );
}
