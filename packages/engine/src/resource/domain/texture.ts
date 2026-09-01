import type { ImageLayer } from '@sharedTypes/engine';
import type { TextureData, AnimationFrame } from '@sharedTypes/resource/texture';
import type { TextureDeps } from '@engine/types/resource-deps';
import type { GameContextLike } from '../core/game-context';
import { ResourceBase, type ResourceInstance } from '../core/resource-base';

type PlayState = 'init' | 'play' | 'stop';

export class Texture extends ResourceBase<'texture'> implements ResourceInstance<'texture'> {
  private startMs: number = 0;
  private playState: PlayState = 'init';

  static async loadDeps(ctx: GameContextLike, data: TextureData): Promise<TextureDeps> {
    data.frames.map((frame) => frame.layers.map((layer) => ctx.assets.cache(layer.image)));
    return {};
  }

  start = () => {
    this.startMs = performance.now();
    this.playState = 'play';
  };

  stop = () => {
    this.playState = 'stop';
  };

  private resolveFrame = (elapsedMs: number): AnimationFrame | undefined => {
    let elapsed = 0;
    for (const frame of this.data.frames) {
      elapsed += frame.duration;
      if (elapsedMs < elapsed) return frame;
    }
    return undefined;
  };

  resolveLayers = (nowMs: number): ImageLayer[] => {
    const elapsedMs = nowMs - this.startMs;
    if (elapsedMs < 0 || this.playState === 'stop') return [];

    const frame = this.resolveFrame(elapsedMs);
    return frame?.layers ?? [];
  };
}
