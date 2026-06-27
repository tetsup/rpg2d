import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { CollectionName, Database } from '@sharedTypes/database/collection';
import { Input } from '../ui/input';
import { InfiniteScrollSelect } from './infinite-scroll-select';
import { FilterMap } from '@sharedTypes/database/filter';

type SelectDocumentProps<T extends CollectionName> = {
  collectionName: T;
  onItemSelect: (item: Database[T]) => void;
};

const renderItemLabels = {
  namespaces: (item: Database['namespaces']) => `${item.id}: ${item.presenceName}`,
  resources: (item: Database['resources']) => `${item.name}: ${item.description}`,
  users: (item: Database['users']) => `${item.presenceName}(${item.email})`,
};

export function SelectDocument<T extends keyof FilterMap>({ collectionName, onItemSelect }: SelectDocumentProps<T>) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  return (
    <>
      <div className="px-4 pb-2">
        <Input placeholder={`${t('検索')}...`} value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
      <InfiniteScrollSelect
        collectionName={collectionName}
        onItemSelect={onItemSelect}
        query={{ name: 'q', value: query }}
        renderItemLabel={renderItemLabels[collectionName] as (item: Database[T]) => string}
      />
    </>
  );
}
