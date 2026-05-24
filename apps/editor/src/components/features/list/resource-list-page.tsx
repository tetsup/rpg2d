import { useState } from 'react';
import type { ResourceType } from '@sharedTypes/resource/common';
import { useScrollState } from '@editor/hooks/ui/scroll-state';
import { SearchBar } from './search-bar';
import { ResourceList } from './resource-list';

export function ResourceListPage() {
  const [query, setQuery] = useState('');
  const [type, setType] = useState<ResourceType>();
  const { scrolled } = useScrollState();

  return (
    <div className="flex h-dvh flex-col">
      <SearchBar compact={scrolled} setQuery={setQuery} setType={setType} />

      <div className="min-h-0 flex-1">
        <ResourceList query={query} type={type} />
      </div>
    </div>
  );
}
