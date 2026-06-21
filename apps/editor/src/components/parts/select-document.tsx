import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { CollectionName, DocumentMap } from '@sharedTypes/database/collection';
import { Input } from '../ui/input';
import { InfiniteScrollSelect } from './infinite-scroll-select';

type SelectDocumentProps<T extends CollectionName> = {
  collectionName: T;
  onItemSelect: (item: DocumentMap[T]) => void;
};

const renderItemLabels = {
  namespace: (item: DocumentMap['namespace']) => `${item.id}: ${item.displayName}`,
  resource: (item: DocumentMap['resource']) => `${item.name}: ${item.description}`,
  user: (item: DocumentMap['user']) => `${item.presenceName}(${item.email})`,
};

export function SelectDocument<T extends CollectionName>({ collectionName, onItemSelect }: SelectDocumentProps<T>) {
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
        query={{ q: query }}
        renderItemLabel={renderItemLabels[collectionName] as (item: DocumentMap[T]) => string}
      />
    </>
  );
}
