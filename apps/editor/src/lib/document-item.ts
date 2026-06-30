import type { ReactNode } from 'react';
import type { Database } from '@sharedTypes/database/collection';
import type { FilterMap } from '@sharedTypes/database/filter';
import { renderDocumentLabel } from '@editor/lib/document-label';
import { renderDocumentThumbnail } from '@editor/lib/document-thumbnail';

export type RenderItemContext = {
  label: string;
  thumbnail: ReactNode | null;
};

export function buildRenderItemContext<K extends keyof FilterMap>(
  collectionName: K,
  item: Database[K]
): RenderItemContext {
  return {
    label: renderDocumentLabel(collectionName, item),
    thumbnail: renderDocumentThumbnail(collectionName, item),
  };
}
