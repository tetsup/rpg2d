import type { ImageLayer } from '@/types/engine';
import type { TextureDeps, TextureData, LayerAnimation } from '@/schemas/image/texture';
import type { GameContext } from '../core/game-context';
import { ResourceBase } from '../core/resource-base';

type PlayState = 'init' | 'play' | 'stop';

export class Texture extends ResourceBase<'texture'> {
  private startMs: number = 0;
  private playState: PlayState = 'init';

  static async loadDeps(ctx: GameContext, data: TextureData): Promise<TextureDeps> {
    data.layers.map((layer) => layer.images.map((image) => ctx.assets.cache(image)));
    return {};
  }

  start() {
    this.startMs = performance.now();
    this.playState = 'play';
  }

  stop() {
    this.playState = 'stop';
  }

  resolveLayers(nowMs: number): ImageLayer[] {
    const elapsedMs = nowMs - this.startMs;
    if (elapsedMs < 0 || this.playState === 'stop') return [];
    return this.data.layers.map((layer) => this.resolveLayer(layer, elapsedMs));
  }

  private resolveLayer(layer: LayerAnimation, elapsedMs: number): ImageLayer {
    if (layer.playback == null) return { priority: layer.priority, image: layer.images[0] };
    const elapsedSteps = elapsedMs / layer.playback.tickMs;
    const index = layer.playback.repeat ? elapsedSteps % layer.images.length : elapsedSteps;
    return { priority: layer.priority, image: layer.images[index] ?? null };
  }
}
