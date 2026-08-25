import type { ImageLayer, Point2d } from '@sharedTypes/engine';
import type { GameContextLike } from '@engine/resource/core/game-context';
import type { ResourceData } from '@sharedTypes/resource/common';
import { PreviewRenderer } from './preview-renderer';
import type { PreviewableResourceType, PreviewResourceInstanceMap } from './preview-factory';

type ImageObject = {
  pos: Point2d;
  imageId: string;
};

export interface RenderableResource {
  resolveLayers: (nowMs: number) => ImageLayer[];
}

export const sortLayers = (layers: ImageLayer[]) => [...layers].sort((a, b) => a.priority - b.priority);

export class PreviewCore {
  private readonly renderer: PreviewRenderer;
  private resources: RenderableResource[] = [];

  constructor(
    canvas: HTMLCanvasElement,
    private readonly ctx: GameContextLike<PreviewResourceInstanceMap>
  ) {
    this.renderer = new PreviewRenderer(canvas);
    this.ctx.assets.setRenderer(this.renderer);
  }

  setResources = async (
    resources: {
      id: string;
      data: ResourceData<PreviewableResourceType>;
      type: PreviewableResourceType;
    }[]
  ) => {
    this.resources = await Promise.all(resources.map(({ id, data, type }) => this.ctx.factory.create(id, data, type)));
  };

  onTick = async (nowMs: number) => {
    const layers = sortLayers(this.resources.flatMap((resource) => resource.resolveLayers(nowMs)));

    await Promise.all(layers.map((layer) => this.ctx.assets.cache(layer.image)));

    this.renderer.render(
      layers.map(
        (layer): ImageObject => ({
          imageId: layer.image,
          pos: { x: 0, y: 0 },
        })
      )
    );
  };

  dispose = () => {
    this.renderer.dispose();
  };
}
