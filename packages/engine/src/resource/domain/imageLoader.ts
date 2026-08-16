import type { ImageData } from '@sharedTypes/resource/image';
import { objToRgba } from '@engine/utils/image/rgba';
import { ResourceBase } from '../core/resource-base';
import type { GameContextLike } from '../core/game-context';
import { rgbaToPng } from '@engine/utils/image/png';

export class ImageLoader extends ResourceBase<'image'> {
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
