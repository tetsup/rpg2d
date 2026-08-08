import type { ReactNode, Ref } from 'react';

type CanvasViewportProps = {
  containerRef: Ref<HTMLDivElement>;
  backgroundRef: Ref<HTMLCanvasElement>;
  overlay: ReactNode;
};

export function CanvasViewport({ containerRef, backgroundRef, overlay }: CanvasViewportProps) {
  return (
    <div ref={containerRef} className="relative size-full overflow-hidden touch-none">
      <canvas ref={backgroundRef} className="absolute inset-0 block size-full [image-rendering:pixelated]" />

      {overlay}
    </div>
  );
}
