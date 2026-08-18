import type { Dispatch, SetStateAction } from 'react';
import { ImageData } from '@sharedTypes/resource/image';
import { CanvasLayout } from '@base/components/canvas/canvas-layout';
import { CanvasViewport } from '@base/components/canvas/canvas-viewport';
import { OverlayCanvas } from '@base/components/canvas/overlay-canvas';
import { ImageToolbar } from './image-toolbar';
import { useImageData } from './hooks/use-image-data';
import { useScreen } from './hooks/use-screen';
import { useToolSet } from './hooks/use-tool-set';

type ImageEditorProps = {
  data: ImageData;
  setData: Dispatch<SetStateAction<ImageData>>;
};

export function ImageEditor({ data, setData }: ImageEditorProps) {
  const image = useImageData({
    data,
    setData,
  });

  const screen = useScreen({
    image,
    cellSize: {
      width: 1,
      height: 1,
    },
  });

  const toolSet = useToolSet({
    image,
    screen,
  });

  return (
    <CanvasLayout
      viewport={
        <CanvasViewport
          containerRef={screen.containerRef}
          backgroundRef={screen.canvasRef}
          overlay={<OverlayCanvas {...toolSet.pointerHandlers} />}
        />
      }
      footer={<ImageToolbar toolSet={toolSet} />}
    />
  );
}
