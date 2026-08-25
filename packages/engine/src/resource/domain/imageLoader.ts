import type { ImageData } from '@sharedTypes/resource/image';
import { objToRgba } from '@engine/utils/image/rgba';
import { rgbaToPng } from '@engine/utils/image/png';
import type { GameContextLike } from '../core/game-context';
import { ResourceBase, type ResourceInstance } from '../core/resource-base';

export class ImageLoader extends ResourceBase<'image'> implements ResourceInstance<'image'> {
  static async loadDeps(ctx: GameContextLike, data: ImageData): Promise<{}> {
    void ctx;
    void data;
    return {};
  }

  async toBitmap() {
    const { size, rgba } = objToRgba(this.data);
    const png = await rgbaToPng(size, rgba);
    return createImageBitmap(png);
  }
}
