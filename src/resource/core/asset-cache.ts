import type { ResourceId } from '@/schemas/common';
import type { ResourceConfig } from '@/schemas/resource-config';

type LazyImage =
  | {
      loaded: false;
    }
  | { loaded: true; image: ImageBitmap };

export class AssetCache {
  images: Map<ResourceId, LazyImage> = new Map();

  constructor(private config: ResourceConfig) {}

  cache = async (id: ResourceId) => {
    if (this.images.has(id)) return;
    this.images.set(id, { loaded: false });
    try {
      const image = await this.fetchBitmap(id);
      this.images.set(id, { loaded: true, image });
    } catch {
      this.images.delete(id);
    }
  };

  private async fetchBitmap(id: ResourceId) {
    const res = await fetch(`${this.config.imageUri}/${id}`);
    return await createImageBitmap(await res.blob());
  }

  get = (id: ResourceId) => {
    const lazy = this.images.get(id);
    if (lazy === undefined) this.cache(id);
    else if (lazy.loaded) return lazy.image;
  };
}
