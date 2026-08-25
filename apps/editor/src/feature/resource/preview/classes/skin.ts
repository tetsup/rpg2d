import { Skin } from '@engine/resource/domain/skin';
import type { Direction2d, ImageLayer } from '@sharedTypes/engine';

export class PreviewSkin extends Skin {
  resolveLayers = (nowMs: number, _direction: Direction2d): ImageLayer[] => {
    const direction = this.resolvePreviewDirection(nowMs);
    return this.resolveLayers(nowMs, direction);
  };

  private resolvePreviewDirection = (nowMs: number): Direction2d => {
    const directions: Direction2d[] = ['down', 'left', 'right', 'up'];
    const index = Math.floor(nowMs / 1000) % directions.length;
    return directions[index];
  };
}
