import { useEffect, useRef, type ReactNode } from 'react';
import type { LayerWithPos } from '@sharedTypes/engine';
import type { ManifestData } from '@sharedTypes/resource/manifest';
import type { ResourceConfig } from '@sharedTypes/config';
import type { ExecutableResourceType, ResourceId } from '@sharedTypes/resource/common';
import type { ResourceStoreLike } from '@engine/resource/core/resource-store';
import type { AssetCacheLike } from '@engine/resource/core/asset-cache';
import { ResourceClass } from '@engine/types/resource';
import { PreviewRenderer } from './preview-renderer';

type ResourceInstance<K extends ExecutableResourceType> = InstanceType<ResourceClass<K>>;

export type PreviewResourceStore = ResourceStoreLike & {
  get<K extends ExecutableResourceType>(id: ResourceId, type: K): Promise<ResourceInstance<K>>;
};

export type PreviewAssetCacheLike = AssetCacheLike & {
  cache(imageId: ResourceId): Promise<void>;
};

export interface PreviewContext {
  readonly manifest: ManifestData;
  readonly config: ResourceConfig;
  readonly resources: PreviewResourceStore;
  readonly assets: PreviewAssetCacheLike;
}

type FetchDependencies<K extends ExecutableResourceType> = (resource: ResourceInstance<K>) => Promise<void>;

type ResolveLayers<K extends ExecutableResourceType> = (resource: ResourceInstance<K>, nowMs: number) => LayerWithPos[];

export type ResourceAnimationProps<K extends ExecutableResourceType> = {
  resource: ResourceInstance<K>;

  manifest: ManifestData;

  config: ResourceConfig;

  /**
   * editor の Repository を ResourceStoreLike に
   * 接続するための関数。
   *
   * ResourceAnimation は Repository 自体を知らない。
   */
  getResource: <T extends ExecutableResourceType>(id: ResourceId, type: T) => Promise<ResourceInstance<T>>;

  /**
   * 親 Resource の依存 Resource を解決する。
   *
   * これは editor 側の責務。
   */
  fetchDependencies: FetchDependencies<K>;

  /**
   * Resource の resolveLayers を呼ぶ処理。
   *
   * Texture / Skin のような単純な Resource は
   * resource.resolveLayers(nowMs) でよい。
   *
   * Field のように viewport が必要な Resource は
   * ここで viewport を与える。
   */
  resolveLayers: ResolveLayers<K>;

  /**
   * Resource の描画開始時刻。
   *
   * engine Resource の start() がある場合は、
   * ここで呼び出す。
   */
  start?: (resource: ResourceInstance<K>) => void;

  /**
   * Canvas の表示サイズ。
   *
   * 未指定なら layer の実サイズを使う。
   */
  width?: number;

  height?: number;

  className?: string;
};

class ResourceStoreAdapter implements PreviewResourceStore {
  constructor(
    private readonly getResource: <K extends ExecutableResourceType>(
      id: ResourceId,
      type: K
    ) => Promise<ResourceInstance<K>>
  ) {}

  get = async <K extends ExecutableResourceType>(id: ResourceId, type: K): Promise<ResourceInstance<K>> => {
    return this.getResource(id, type);
  };
}

class PreviewAssetCache implements PreviewAssetCacheLike {
  constructor(
    private readonly resources: PreviewResourceStore,
    private readonly renderer: PreviewRenderer
  ) {}

  cache = async (imageId: ResourceId) => {
    if (this.renderer.hasImage(imageId)) {
      return;
    }

    const image = await this.resources.get(imageId, 'image');

    const imageData = await createImageBitmapFromResource(image.data);

    this.renderer.registerImage({
      imageId,
      imageData,
    });
  };
}

class PreviewContextImpl implements PreviewContext {
  readonly resources: PreviewResourceStore;
  readonly assets: PreviewAssetCacheLike;

  constructor(
    readonly manifest: ManifestData,
    readonly config: ResourceConfig,
    renderer: PreviewRenderer,
    getResource: <K extends ExecutableResourceType>(id: ResourceId, type: K) => Promise<ResourceInstance<K>>
  ) {
    this.resources = new ResourceStoreAdapter(getResource);
    this.assets = new PreviewAssetCache(this.resources, renderer);
  }
}

export function ResourceAnimation<K extends ExecutableResourceType>({
  resource,
  manifest,
  config,
  getResource,
  fetchDependencies,
  resolveLayers,
  start,
  width,
  height,
  className,
}: ResourceAnimationProps<K>): ReactNode {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<PreviewRenderer | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const renderer = new PreviewRenderer(canvas);

    rendererRef.current = renderer;

    return () => {
      renderer.dispose();
      rendererRef.current = null;
    };
  }, []);

  useEffect(() => {
    let disposed = false;
    let frameId: number | undefined;

    const run = async () => {
      const renderer = rendererRef.current;

      if (!renderer) return;

      /*
       * ResourceAnimation 自身は dependency の中身を知らない。
       * editor 側から渡された resolver に任せる。
       */
      await fetchDependencies(resource);

      if (disposed) return;

      const context = new PreviewContextImpl(manifest, config, renderer, getResource);

      /*
       * Resource 自体はすでに repository から取得済み。
       *
       * Context は Resource の resolveLayers() が必要とする
       * resources / assets を提供するためだけに使う。
       *
       * Resource の constructor / factory / validation は
       * ここでは行わない。
       */

      void context;

      start?.(resource);

      const render = (nowMs: number) => {
        if (disposed) return;

        const layers = resolveLayers(resource, nowMs);

        renderer.renderLayers(layers);

        frameId = requestAnimationFrame(render);
      };

      frameId = requestAnimationFrame(render);
    };

    void run();

    return () => {
      disposed = true;

      if (frameId !== undefined) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [resource, manifest, config, getResource, fetchDependencies, resolveLayers, start]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={className}
      style={{
        imageRendering: 'pixelated',
      }}
    />
  );
}

async function createImageBitmapFromResource(data: {
  width: number;
  height: number;
  pixels: number[] | Uint8Array;
}): Promise<ImageBitmap> {
  const canvas = new OffscreenCanvas(data.width, data.height);

  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Failed to create 2d rendering context');
  }

  const pixels = data.pixels instanceof Uint8Array ? data.pixels : new Uint8Array(data.pixels);

  context.putImageData(new ImageData(new Uint8ClampedArray(pixels), data.width, data.height), 0, 0);

  return canvas.transferToImageBitmap();
}
