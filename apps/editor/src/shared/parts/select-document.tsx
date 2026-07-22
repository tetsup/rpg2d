import { useMemo, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { Database } from '@sharedTypes/database/collection';
import type { FilterMap } from '@sharedTypes/database/filter';
import type { ResourceType } from '@sharedTypes/resource/common';
import { Input } from '@base/components/ui/input';
import type { RenderItemContext } from '../lib/document-item';
import { InfiniteScrollSelect } from './infinite-scroll-select';

type SelectDocumentProps<T extends keyof FilterMap> = {
  collectionName: T;
  onItemSelect: (item: Database[T]) => void;
  resourceType?: ResourceType;
  renderItem?: (item: Database[T], ctx: RenderItemContext) => ReactNode;
};

function buildQuery<T extends keyof FilterMap>(
  collectionName: T,
  searchText: string,
  resourceType?: ResourceType
): FilterMap[T][] {
  const filters: FilterMap[T][] = [{ name: 'q', value: searchText } as FilterMap[T]];
  if (collectionName === 'resources' && resourceType) {
    filters.push({ name: 'type', op: 'eq', value: resourceType } as FilterMap[T]);
  }
  return filters;
}

export function SelectDocument<T extends keyof FilterMap>({
  collectionName,
  onItemSelect,
  resourceType,
  renderItem,
}: SelectDocumentProps<T>) {
  const { t } = useTranslation();
  const [searchText, setSearchText] = useState('');
  const query = useMemo(
    () => buildQuery(collectionName, searchText, resourceType),
    [collectionName, searchText, resourceType]
  );

  return (
    <>
      <div className="px-4 pb-2">
        <Input placeholder={`${t('検索')}...`} value={searchText} onChange={(e) => setSearchText(e.target.value)} />
      </div>
      <InfiniteScrollSelect
        collectionName={collectionName}
        onItemSelect={onItemSelect}
        query={query}
        renderItem={renderItem}
      />
    </>
  );
}
