import type { ResourceType } from '@sharedTypes/resource/common';

export type SaveLayerScope = 'image' | 'texture' | 'skin';

export type DraftChildRef = {
  id: string;
  type: ResourceType;
  label: string;
};

export type SaveLayerItem = {
  scope: SaveLayerScope;
  label: string;
  isDirty: boolean;
  isValid: boolean;
  hasDraftDescendants: boolean;
  draftChildren: DraftChildRef[];
  invalidMessages: string[];
};
