import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useInView } from 'react-intersection-observer';
import { Database } from '@sharedTypes/database/collection';
import { useDocumentList } from '@editor/hooks/api/search';
import { Command, CommandEmpty, CommandGroup, CommandItem } from '../ui/command';
import { FilterMap } from '@sharedTypes/database/filter';

type InfiniteScrollSelectProps<T extends keyof FilterMap> = {
  collectionName: T;
  onItemSelect: (item: Database[T]) => void;
  query: FilterMap[T];
  renderItemLabel: (item: Database[T]) => string;
};

export function InfiniteScrollSelect<T extends keyof FilterMap>({
  collectionName,
  onItemSelect,
  query,
  renderItemLabel,
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
        {allItems.map((item, index) => (
          <CommandItem key={index} onSelect={() => onItemSelect(item)}>
            {renderItemLabel(item)}
          </CommandItem>
        ))}
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
