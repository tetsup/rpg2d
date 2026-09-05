import { useMemo, useState } from 'react';
import type { FilterMap } from '@sharedTypes/database/filter';
import { SearchInput } from '@base/components/search/search-input';
import { DialogLayout } from '@base/components/dialog/dialog-layout';
import { InfiniteList } from '@editor/shared/components/infinite-list/infinite-list';
import { createRepository } from '@editor/shared/repository/factory';

type SelectDialogProps<T extends keyof FilterMap> = {
  open: boolean;
  onCommit: (id: string) => void;
  onClose: () => void;
  title: string;
  renderItem: (id: string) => React.ReactNode;
  mergeQuery: (text: string) => FilterMap[T][];
  useInfiniteSearch: ReturnType<typeof createRepository<T>>['useInfiniteSearch'];
  itemSize: 'full' | 'sm' | 'md' | 'lg';
};

export function SelectDialog<T extends keyof FilterMap>({
  open,
  onCommit,
  onClose,
  title,
  renderItem,
  mergeQuery,
  useInfiniteSearch,
  itemSize,
}: SelectDialogProps<T>) {
  const [searchText, setSearchText] = useState('');
  const mergedQuery = useMemo(() => mergeQuery(searchText), [mergeQuery, searchText]);

  return (
    <DialogLayout
      open={open}
      onClose={onClose}
      title={title}
      content={
        <>
          <SearchInput value={searchText} onChange={(v) => setSearchText(v)} />
          <InfiniteList
            query={mergedQuery}
            useInfiniteSearch={useInfiniteSearch}
            renderItem={renderItem}
            onSelect={onCommit}
            size={itemSize}
          />
        </>
      }
    />
  );
}
