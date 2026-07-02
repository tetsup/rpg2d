import type { ResourceDocument } from '@sharedTypes/database/collection';

type TextureData = ResourceDocument<'texture'>['data'];

/** Layers sorted by priority. UI currently edits index 0; extend SwitcherPopup to add more. */
export function getTextureLayers(texture: TextureData) {
  return [...texture.layers].sort((a, b) => a.priority - b.priority);
}

export const DEFAULT_EDITABLE_LAYER_INDEX = 0;
