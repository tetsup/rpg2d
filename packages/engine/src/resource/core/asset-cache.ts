import { GameRenderer } from '@tetsup/web2d';
import type { ResourceId } from '@sharedTypes/resource/common';
import { ImageLoader } from '../domain/imageLoader';
import { ResourceStore } from './resource-store';

type LazyImage =
  | {
      loaded: false;
    }
  | { loaded: true; image: ImageBitmap };

export interface AssetCacheLike {}

export class AssetCache implements AssetCacheLike {
  private images: Map<ResourceId, LazyImage> = new Map();
  private renderer?: GameRenderer;
  constructor(protected resources: ResourceStore) {}

  setRenderer(renderer: GameRenderer) {
    this.renderer = renderer;
  }

  cache = async (id: ResourceId) => {
    if (this.images.has(id)) return;
    if (this.renderer === undefined) throw new Error('renderer has not been initialized');
    this.images.set(id, { loaded: false });
    try {
      const image = await this.fetchBitmap(id);
      this.renderer.registerImage({ imageId: id, imageData: image });
      this.images.set(id, { loaded: true, image });
    } catch (e) {
      this.images.delete(id);
      throw e;
    }
  };

  registerImage = this.renderer?.registerImage;

  private async fetchBitmap(id: ResourceId) {
    const image = (await this.resources.get(id, 'image')) as ImageLoader;
    return await image.toBitmap();
  }
}
