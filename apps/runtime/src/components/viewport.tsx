import { RefObject } from 'react';

export function RuntimeViewport({ canvasRef }: { canvasRef: RefObject<HTMLCanvasElement | null> }) {
  return (
    <div className="runtime-viewport">
      <canvas width={320} height={240} className="runtime-canvas" ref={canvasRef} />
    </div>
  );
}
