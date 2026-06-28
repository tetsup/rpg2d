import type { Database } from '@sharedTypes/database/collection';
import type { FilterMap } from '@sharedTypes/database/filter';

const renderItemLabels = {
  namespaces: (item: Database['namespaces']) => `${item.id}: ${item.presenceName}`,
  resources: (item: Database['resources']) => `${item.name}: ${item.description}`,
  users: (item: Database['users']) => `${item.presenceName}(${item.email})`,
} satisfies {
  [K in keyof FilterMap]: (item: Database[K]) => string;
};

export function renderDocumentLabel<T extends keyof FilterMap>(collectionName: T, item: Database[T]): string {
  const render = renderItemLabels[collectionName] as (document: Database[T]) => string;
  return render(item);
}
