import { RefObject } from 'react';

export function RuntimeViewport({ canvasRef }: { canvasRef: RefObject<HTMLCanvasElement | null> }) {
  return (
    <div className="runtime-viewport">
      <canvas className="runtime-canvas" ref={canvasRef} />
    </div>
  );
}
