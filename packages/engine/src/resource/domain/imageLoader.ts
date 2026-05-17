import type { ImageData } from '@sharedTypes/resource/image';
import { objToRgba } from '@engine/utils/image/rgba';
import { ResourceBase } from '../core/resource-base';
import type { GameContext } from '../core/game-context';
import { rgbaToPng } from '@engine/utils/image/png';

export class ImageLoader extends ResourceBase<'image'> {
  static async loadDeps(ctx: GameContext, data: ImageData): Promise<{}> {
    return {};
  }

  async toBitmap() {
    const { size, rgba } = objToRgba(this.data);
    const png = await rgbaToPng(size, rgba);
    return createImageBitmap(png);
  }
}
