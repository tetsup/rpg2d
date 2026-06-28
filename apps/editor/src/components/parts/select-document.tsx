import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Database } from '@sharedTypes/database/collection';
import type { FilterMap } from '@sharedTypes/database/filter';
import type { ResourceType } from '@sharedTypes/resource/common';
import { Input } from '../ui/input';
import { InfiniteScrollSelect } from './infinite-scroll-select';

type SelectDocumentProps<T extends keyof FilterMap> = {
  collectionName: T;
  onItemSelect: (item: Database[T]) => void;
  resourceType?: ResourceType;
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
}: SelectDocumentProps<T>) {
  const { t } = useTranslation();
  const [searchText, setSearchText] = useState('');
  const query = useMemo(
    () => buildQuery(collectionName, searchText, resourceType),
    [collectionName, searchText, resourceType]
  );

  const renderItemLabels = {
    namespaces: (item: Database['namespaces']) => `${item.id}: ${item.presenceName}`,
    resources: (item: Database['resources']) => `${item.name}: ${item.description}`,
    users: (item: Database['users']) => `${item.presenceName}(${item.email})`,
  };

  return (
    <>
      <div className="px-4 pb-2">
        <Input placeholder={`${t('検索')}...`} value={searchText} onChange={(e) => setSearchText(e.target.value)} />
      </div>
      <InfiniteScrollSelect
        collectionName={collectionName}
        onItemSelect={onItemSelect}
        query={query}
        renderItemLabel={renderItemLabels[collectionName] as (item: Database[T]) => string}
      />
    </>
  );
}
