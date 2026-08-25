import { useCallback, useEffect, useRef } from 'react';
import type { Size2d } from '@sharedTypes/engine';
import type { ManifestData } from '@sharedTypes/resource/manifest';
import { CanvasSkeleton } from '@base/components/canvas/canvas-skeleton';
import { PreviewContext } from './preview-context';
import { PreviewCore } from './preview-core';
import type { PreviewableResourceType } from './preview-factory';

type ResourcePreviewProps<K extends PreviewableResourceType> = {
  resource: {
    id: string;
    type: K;
    data: any;
  };
  width: number;
  height: number;
  className?: string;
  screen?: Size2d;
  blockSize?: Size2d;
  textSize?: Size2d;
  moveDurationMs?: number;
};

export function ResourcePreview<K extends PreviewableResourceType>({
  resource,
  width,
  height,
  className,
  screen = { width, height },
  blockSize = { width: 16, height: 16 },
  textSize = { width: 7, height: 7 },
  moveDurationMs = 500,
}: ResourcePreviewProps<K>) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const manifest = useCallback(
    (): ManifestData => ({
      initialState: {
        core: { players: [], variables: {}, mode: 'field' },
        field: { fieldId: '', pos: { x: 0, y: 0 }, direction: 'down', actionIds: [] },
      },
      schemas: { playerState: {} },
      config: {
        blockSize,
        textSize,
        screen,
        moveDurationMs,
        defaultMessagePanel: '',
        messageConfig: { speedMs: 100, margin: { left: 0, right: 0, top: 0, bottom: 0 } },
      },
    }),
    [screen, blockSize, textSize, moveDurationMs, width, height]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let disposed = false;
    let frameId: number | undefined;

    const ctx = new PreviewContext(manifest(), {
      resourceUri: '',
    });
    const core = new PreviewCore(canvas, ctx);
    const run = async () => {
      if (disposed) return;

      core.setResources([resource]);
      const tick = async (nowMs: number) => {
        if (disposed) return;

        await core.onTick(nowMs);
        if (!disposed) frameId = requestAnimationFrame(tick);
      };
      frameId = requestAnimationFrame(tick);
    };
    run();

    return () => {
      disposed = true;
      if (frameId !== undefined) cancelAnimationFrame(frameId);
      core.dispose();
    };
  }, [resource.id, resource.type, resource.data, manifest]);

  return canvasRef ? (
    <canvas
      ref={canvasRef}
      width={screen.width}
      height={screen.height}
      className={className}
      style={{ imageRendering: 'pixelated', width, height }}
    />
  ) : (
    <CanvasSkeleton width={width} height={height} />
  );
}
