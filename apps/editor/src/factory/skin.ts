import type { SkinData } from '@sharedTypes/resource/skin';

export function buildSkinData(data: Partial<SkinData> = {}): SkinData {
  return {
    textures: {
      up: '',
      down: '',
      left: '',
      right: '',
    },
    ...data,
  };
}
