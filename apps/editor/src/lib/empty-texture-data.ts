import type { ResourceDocument } from '@sharedTypes/database/collection';

type TextureData = ResourceDocument<'texture'>['data'];

export function createEmptyTextureData(): TextureData {
  return {
    layers: [{ priority: 8, images: [] }],
  };
}
