import type { ImageData } from '@sharedTypes/resource/image';
import type { ImageLayer } from '@sharedTypes/engine';
import type { GameContextLike } from '@engine/resource/core/game-context';
import { ImageLoader } from '@engine/resource/domain/imageLoader';
import type { PreviewResourceInstanceMap } from '../preview-factory';
import { PreviewResourceBase, type PreviewResourceInstance } from './base';

export class PreviewImage extends PreviewResourceBase<'image'> implements PreviewResourceInstance<'image'> {
  static async loadDeps(ctx: GameContextLike<PreviewResourceInstanceMap>, data: ImageData) {
    return ImageLoader.loadDeps(ctx as any, data);
  }

  resolveLayers(_: number): ImageLayer[] {
    return [{ priority: 8, image: this.id }];
  }
}
