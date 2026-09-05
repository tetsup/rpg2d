import type { GameRenderer } from '@tetsup/web2d';
import type { ResourceId } from '@sharedTypes/resource/common';
import type { ImageLoader } from '../domain/imageLoader';
import type { ResourceStoreLike } from './resource-store';
import type { ResourceInstanceMapLike } from './resource-factory';

type LazyImage =
  | {
      loaded: false;
    }
  | { loaded: true; image: ImageBitmap };

export interface AssetCacheLike {
  setRenderer: (renderer: GameRenderer) => void;
  cache: (id: ResourceId) => Promise<void>;
  registerImage?: (image: { imageId: ResourceId; imageData: ImageBitmap }) => void;
}

export class AssetCache implements AssetCacheLike {
  private images: Map<ResourceId, LazyImage> = new Map();
  private renderer?: GameRenderer;
  constructor(protected resources: ResourceStoreLike<ResourceInstanceMapLike<any>>) {}

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

  get = (id: ResourceId) => {
    const lazy = this.images.get(id);
    if (lazy === undefined) this.cache(id);
    else if (lazy.loaded) return lazy.image;
  };
}
