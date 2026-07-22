import type { ResourceDocument } from '@sharedTypes/database/collection';

type SkinData = ResourceDocument<'skin'>['data'];

export function createEmptySkinData(): SkinData {
  return {
    textures: {
      down: null,
      up: null,
      left: null,
      right: null,
    },
  };
}
