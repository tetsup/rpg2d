import type { TextureData } from '@sharedTypes/resource/texture';

export function buildTextureData(data: Partial<TextureData> = {}): TextureData {
  return {
    layers: [],
    ...data,
  };
}
