import type { ImageLayer } from '@sharedTypes/engine';
import type { AnimationFrame, TextureData } from '@sharedTypes/resource/texture';

export function buildLayerData(data: Partial<ImageLayer> = {}): ImageLayer {
  return {
    image: '',
    priority: 7,
    pos: { x: 0, y: 0 },
    ...data,
  };
}

export function buildFrameData(data: Partial<AnimationFrame> = {}): AnimationFrame {
  return {
    layers: [],
    duration: 100,
    ...data,
  };
}

export function buildTextureData(data: Partial<TextureData> = {}): TextureData {
  return {
    frames: data?.frames ?? [buildFrameData()],
    postAction: 'repeat',
    ...data,
  };
}
