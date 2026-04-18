import type { ResourceManager } from './resource-manager';
import { ResourceBase } from './resource-base';
import { TexturePlayback, type TextureData, TextureSchema } from '@/schemas/image/texture';

export class Texture extends ResourceBase<'texture'> {
  static schema = TextureSchema;
  private playback: TexturePlayback;
  private startMs: number = 0;
  constructor(
    protected resources: ResourceManager,
    protected data: TextureData,
    protected deps: {}
  ) {
    super(resources, data, deps);
    this.playback = data.playback ?? resources.config.texture.playback;
  }

  currentImage(nowMs: number): ImageBitmap | null {
    const elapsedMs = nowMs - this.startMs;
    if (elapsedMs < 0) return null;
    const elapsedSteps = Math.floor(elapsedMs / this.playback.tickMs);
    const imageCount = this.data.images.length;
    if (!this.playback.repeat && elapsedSteps > imageCount) return null;
    return this.resources.images.get(this.data.images[elapsedSteps % imageCount]) ?? null;
  }
}
