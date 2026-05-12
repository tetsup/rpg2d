import type { GameContext } from '@/resource/core/game-context';
import { ResourceBase } from '@/resource/core/resource-base';
import type { PanelSkinData, PanelSkinDeps } from '@/schemas/panel/panel-skin';
import type { LayerWithPos } from '@/types/engine';
import { Rect } from '@/utils/rect';
import { Color } from './color';

export type TextArea = {
  rect: Rect;
  message: string[];
  overflowX: 'wrap' | 'hide';
  overflowY: 'scroll' | 'hide';
};

export class PanelSkin extends ResourceBase<'panel-skin'> {
  private panelPriority: number = 0;

  static async loadDeps(ctx: GameContext, data: PanelSkinData): Promise<PanelSkinDeps> {
    return {
      plane: await ctx.resources.get(data.plane, 'texture'),
      topLeft: await ctx.resources.get(data.topLeft, 'texture'),
      topRight: await ctx.resources.get(data.topRight, 'texture'),
      bottomLeft: await ctx.resources.get(data.bottomLeft, 'texture'),
      bottomRight: await ctx.resources.get(data.bottomRight, 'texture'),
      top: await ctx.resources.get(data.top, 'texture'),
      bottom: await ctx.resources.get(data.bottom, 'texture'),
      left: await ctx.resources.get(data.left, 'texture'),
      right: await ctx.resources.get(data.right, 'texture'),
      defaultFont: await ctx.resources.get(data.defaultFont, 'font'),
      defaultTextColor: new Color(
        data.defaultTextColor.r,
        data.defaultTextColor.g,
        data.defaultTextColor.b,
        data.defaultTextColor.a
      ),
    };
  }

  setPanelPriority(priority: number) {
    this.panelPriority = priority;
  }

  resolveTexture = (rect: Rect, x: number, y: number) => {
    switch (x) {
      case rect.left:
        switch (y) {
          case rect.top:
            return this.deps.topLeft;
          case rect.bottom - 1:
            return this.deps.bottomLeft;
          default:
            return this.deps.left;
        }
      case rect.right - 1:
        switch (y) {
          case rect.top:
            return this.deps.topRight;
          case rect.bottom - 1:
            return this.deps.bottomRight;
          default:
            return this.deps.right;
        }
      default:
        switch (y) {
          case rect.top:
            return this.deps.top;
          case rect.bottom - 1:
            return this.deps.bottom;
          default:
            return this.deps.plane;
        }
    }
  };

  resolvePanelLayers = (nowMs: number, rect: Rect) => {
    let layers: LayerWithPos[][] = [];
    for (let y = rect.top; y < rect.bottom; y++) {
      for (let x = rect.left; x < rect.right; x++) {
        const texture = this.resolveTexture(rect, x, y);
        layers.push(
          texture.resolveLayers(nowMs).map((layer) => ({
            rect: new Rect(
              x * this.ctx.manifest.config.blockSize.width,
              y * this.ctx.manifest.config.blockSize.height,
              this.ctx.manifest.config.blockSize.width,
              this.ctx.manifest.config.blockSize.height
            ),
            layer,
          }))
        );
      }
    }
    return layers.flat(1);
  };

  get textPriority() {
    return 16 + this.panelPriority * 16 + 15;
  }

  resolveTextLayers = (rect: Rect, textArea: TextArea): LayerWithPos[] => {
    const images: string[][] = [];
    textArea.message.forEach((text) => {
      images.push([]);
      for (const str of text) {
        const letters = this.deps.defaultFont.resolveImages(str, this.deps.defaultTextColor);
        if (images.at(-1)!.length + letters.length >= textArea.rect.width) {
          if (textArea.overflowX === 'hide') return;
          else images.push([]);
        }
        letters.forEach((letter) => {
          images.at(-1)!.push(letter);
        });
      }
    });

    const panelLeft = rect.left * this.ctx.manifest.config.blockSize.width;
    const panelTop = rect.top * this.ctx.manifest.config.blockSize.width;
    return images
      .slice(-textArea.rect.height)
      .flatMap((line, y) =>
        line.map((image, x) =>
          image
            ? {
                rect: new Rect(
                  panelLeft + (textArea.rect.left + x) * this.ctx.manifest.config.textSize.width,
                  panelTop + (textArea.rect.top + y) * this.ctx.manifest.config.textSize.height,
                  this.ctx.manifest.config.textSize.width,
                  this.ctx.manifest.config.textSize.height
                ),
                layer: { image, priority: this.textPriority },
              }
            : null
        )
      )
      .filter((layer) => layer != null);
  };

  resolveLayers = (nowMs: number, rect: Rect, textAreas: TextArea[]): LayerWithPos[] => {
    return [
      ...this.resolvePanelLayers(nowMs, rect),
      ...textAreas.flatMap((textArea) => this.resolveTextLayers(rect, textArea)),
    ];
  };
}
