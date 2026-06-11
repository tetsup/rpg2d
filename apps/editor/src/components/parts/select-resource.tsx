import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ResourceType } from '@sharedTypes/resource/common';
import type { ResourceDocument } from '@sharedTypes/database/collection';
import { Input } from '../ui/input';
import { InfiniteScrollSelect } from './infinite-scroll-select';

type SelectResourceProps<T> = {
  type: ResourceType;
  onItemSelect: (item: T) => void;
};

export function SelectResource<T extends ResourceDocument>({ type, onItemSelect }: SelectResourceProps<T>) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  return (
    <>
      <div className="px-4 pb-2">
        <Input placeholder={`${t('検索')}...`} value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
      <InfiniteScrollSelect type={type} onItemSelect={onItemSelect} query={query} />
    </>
  );
}
