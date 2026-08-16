import { useEffect, useMemo, useRef } from 'react';
import type { ManifestData } from '@sharedTypes/resource/manifest';
import type { ExecutableResourceType, ResourceId } from '@sharedTypes/resource/common';
import type { LayerWithPos } from '@sharedTypes/engine';
import type { ResourceClass } from '@engine/types/resource';
import type { ResourceBase } from '@engine/resource/core/resource-base';
import { PreviewContext } from './preview-context';
import { PreviewRenderer } from './preview-renderer';

type ResourceInstance<K extends ExecutableResourceType> = InstanceType<ResourceClass<K>>;

type ResolvableResource = ResourceBase<ExecutableResourceType> & {
  resolveLayers: (nowMs: number) => LayerWithPos[];
};

type ResourcePreviewProps<K extends ExecutableResourceType> = {
  resourceId: ResourceId;
  resourceType: K;
  blockSize: {
    width: number;
    height: number;
  };
  className?: string;
};

const PREVIEW_SCREEN_SIZE = {
  width: 1024,
  height: 1024,
};

const createPreviewManifest = (blockSize: ResourcePreviewProps<ExecutableResourceType>['blockSize']): ManifestData => {
  return {
    initialState: {
      core: {
        players: [],
        variables: {},
        mode: 'field',
      },
      field: {
        fieldId: '__preview__',
        pos: {
          x: 0,
          y: 0,
        },
        direction: 'down',
        actionIds: [],
      },
    },

    schemas: {
      playerState: {},
    },

    config: {
      blockSize,
      textSize: blockSize,
      moveDurationMs: 0,
      screen: PREVIEW_SCREEN_SIZE,
      defaultMessagePanel: '__preview__',
      messageConfig: {
        speedMs: 0,
        margin: {
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
        },
      },
    },
  };
};

export function ResourcePreview<K extends ExecutableResourceType>({
  resourceId,
  resourceType,
  blockSize,
  className,
}: ResourcePreviewProps<K>) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<PreviewRenderer | null>(null);

  const manifest = useMemo(() => createPreviewManifest(blockSize), [blockSize.width, blockSize.height]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new PreviewRenderer(canvas);
    rendererRef.current = renderer;
    let disposed = false;
    let frameId: number | null = null;
    let context: PreviewContext | null = null;
    let resource: ResourceInstance<K> | null = null;

    const initialize = async () => {
      context = new PreviewContext(manifest, { resourceUri: '' }, renderer);
      resource = await context.resources.get(resourceId, resourceType);
      if (disposed) return;

      const previewResource = asResolvableResource(resource?.data);
      const startMs = performance.now();
      const render = (nowMs: number) => {
        if (disposed) return;

        const elapsedMs = nowMs - startMs;
        const layers = previewResource.resolveLayers(elapsedMs);
        renderer.renderLayers(layers);
        frameId = requestAnimationFrame(render);
      };
      frameId = requestAnimationFrame(render);
    };

    void initialize();

    return () => {
      disposed = true;
      if (frameId !== null) cancelAnimationFrame(frameId);

      renderer.dispose();
      rendererRef.current = null;
    };
  }, [resourceId, resourceType, manifest]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        imageRendering: 'pixelated',
      }}
    />
  );
}

function asResolvableResource(resource: ResourceBase<ExecutableResourceType>): ResolvableResource {
  if (!('resolveLayers' in resource) || typeof resource.resolveLayers !== 'function')
    throw new Error(`Resource ${resource} cannot be previewed`);

  return resource as ResolvableResource;
}
