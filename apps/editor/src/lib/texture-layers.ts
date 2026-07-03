import type { ResourceDocument } from '@sharedTypes/database/collection';

type TextureData = ResourceDocument<'texture'>['data'];

/** Layers sorted by priority. UI currently edits index 0; extend SwitcherPopup to add more. */
export function getTextureLayers(texture: TextureData) {
  return [...texture.layers].sort((a, b) => a.priority - b.priority);
}

export const DEFAULT_EDITABLE_LAYER_INDEX = 0;

export function getDefaultEditableLayer(texture: TextureData) {
  return getTextureLayers(texture)[DEFAULT_EDITABLE_LAYER_INDEX];
}

export function appendImageToDefaultLayer(texture: TextureData, imageId: string): TextureData {
  if (texture.layers.length === 0) {
    return { layers: [{ priority: 8, images: [imageId] }] };
  }

  const targetPriority = getDefaultEditableLayer(texture).priority;

  return {
    layers: texture.layers.map((layer) =>
      layer.priority === targetPriority
        ? { ...layer, images: [...layer.images, imageId] }
        : layer
    ),
  };
}

export function getDefaultLayerImageIds(texture: TextureData): string[] {
  return getDefaultEditableLayer(texture)?.images ?? [];
}
