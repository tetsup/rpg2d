import type { ResourceId } from '@/types/engine';

type LazyImage =
  | {
      loaded: false;
    }
  | { loaded: true; image: ImageBitmap };

export class ImageCache {
  images: Map<ResourceId, LazyImage> = new Map();

  constructor(localImages?: Record<ResourceId, ImageBitmap>) {
    if (localImages !== undefined) this.loadLocalImages(localImages);
  }

  private loadLocalImages(localImages: Record<ResourceId, ImageBitmap>) {
    Object.entries(localImages).map(([id, image]) => {
      this.images.set(id, { loaded: true, image });
    });
  }

  async cache(id: ResourceId) {
    if (this.images.has(id)) return;
    this.images.set(id, { loaded: false });
    try {
      const image = await this.fetchBitmap(id);
      this.images.set(id, { loaded: true, image });
    } catch {
      this.images.delete(id);
    }
  }

  private async fetchBitmap(id: ResourceId) {
    const res = await fetch(`${process.env.RESOURCE_URI}/${id}`);
    return await createImageBitmap(await res.blob());
  }

  get(id: ResourceId) {
    const lazy = this.images.get(id);
    if (lazy === undefined) this.cache(id);
    else if (lazy.loaded) return lazy.image;
  }
}
