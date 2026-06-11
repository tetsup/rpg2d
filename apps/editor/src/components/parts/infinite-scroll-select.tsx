import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useInView } from 'react-intersection-observer';
import type { ResourceType } from '@sharedTypes/resource/common';
import type { ResourceDocument } from '@sharedTypes/database/collection';
import { Command, CommandEmpty, CommandGroup, CommandItem } from '../ui/command';
import { useDocumentList } from '@editor/hooks/api/search';

type InfiniteScrollSelectProps<T> = {
  onItemSelect: (item: T) => void;
  query: string;
  type: ResourceType;
};

export function InfiniteScrollSelect<T extends ResourceDocument>({
  onItemSelect,
  query,
  type,
}: InfiniteScrollSelectProps<T>) {
  const { t } = useTranslation();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useDocumentList<'resource'>({ query, type });
  const { ref, inView } = useInView();
  useEffect(() => {
    if (inView && hasNextPage) fetchNextPage();
  }, [inView, hasNextPage, fetchNextPage]);
  const allItems = data?.pages.flatMap((page) => page.items) || [];

  return (
    <Command>
      <CommandEmpty>
        <div className="p-4 text-sm text-muted-foreground">{t('見つかりませんでした')}</div>
      </CommandEmpty>
      <CommandGroup>
        {allItems.map((item, index) => (
          <CommandItem key={index} onSelect={() => onItemSelect(item)}>
            {`${item.namespace}/${item.type}/${item.name}`}
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
