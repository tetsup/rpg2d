import { useCallback, useRef, type PointerEvent as ReactPointerEvent, type ReactNode, type Ref } from 'react';
import type { OperationMode } from '@editor/lib/paint-editor/operation-mode';
import { cn } from '@editor/lib/utils';

type CanvasViewportProps = {
  operationMode: OperationMode;
  children: ReactNode;
  className?: string;
  containerRef?: Ref<HTMLDivElement>;
};

export function CanvasViewport({
  operationMode,
  children,
  className,
  containerRef,
}: CanvasViewportProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isPanningRef = useRef(false);
  const panOriginRef = useRef({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });

  const setScrollRef = useCallback(
    (node: HTMLDivElement | null) => {
      scrollRef.current = node;
      if (containerRef == null) return;
      if (typeof containerRef === 'function') {
        containerRef(node);
        return;
      }
      containerRef.current = node;
    },
    [containerRef]
  );

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (operationMode !== 'pan' || scrollRef.current == null) return;
      isPanningRef.current = true;
      panOriginRef.current = {
        x: event.clientX,
        y: event.clientY,
        scrollLeft: scrollRef.current.scrollLeft,
        scrollTop: scrollRef.current.scrollTop,
      };
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [operationMode]
  );

  const handlePointerMove = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    const container = scrollRef.current;
    if (!isPanningRef.current || container == null) return;
    const dx = event.clientX - panOriginRef.current.x;
    const dy = event.clientY - panOriginRef.current.y;
    container.scrollLeft = panOriginRef.current.scrollLeft - dx;
    container.scrollTop = panOriginRef.current.scrollTop - dy;
  }, []);

  const stopPanning = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isPanningRef.current) return;
    isPanningRef.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }, []);

  return (
    <div
      ref={setScrollRef}
      className={cn(
        'min-h-0 flex-1 overflow-auto',
        operationMode === 'pan' && 'cursor-grab active:cursor-grabbing',
        className
      )}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={stopPanning}
      onPointerCancel={stopPanning}
    >
      <div className="flex min-h-full items-center justify-center p-2">{children}</div>
    </div>
  );
}
