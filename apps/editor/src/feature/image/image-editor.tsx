import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ResourcePath } from '@sharedTypes/resource/common';
import { ImageData } from '@sharedTypes/resource/image';
import { ResourceInput } from '@sharedTypes/database/collection';
import { ResourceInputSchemaMap } from '@schema/database/resource';
import { CanvasLayout } from '@base/components/canvas/canvas-layout';
import { CanvasViewport } from '@base/components/canvas/canvas-viewport';
import { OverlayCanvas } from '@base/components/canvas/overlay-canvas';
import { ImageToolbar } from './image-toolbar';
import { useImageData } from './hooks/use-image-data';
import { useScreen } from './hooks/use-screen';
import { useToolSet } from './hooks/use-tool-set';

type ImageEditorProps = {
  defaultValues: ResourceInput<'image'>;
  defaultPath?: ResourcePath;
};

export function ImageEditor({ defaultValues, defaultPath }: ImageEditorProps) {
  const form = useForm({
    defaultValues,
    resolver: zodResolver(ResourceInputSchemaMap.image),
    mode: 'all',
  });

  const image = useImageData({
    defaultValue: defaultValues.data as ImageData,
    onCommit: (data) => form.setValue('data', data),
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
    <FormProvider {...form}>
      <CanvasLayout
        viewport={
          <CanvasViewport
            containerRef={screen.containerRef}
            backgroundRef={screen.canvasRef}
            overlay={<OverlayCanvas {...toolSet.pointerHandlers} />}
          ></CanvasViewport>
        }
        footer={<ImageToolbar toolSet={toolSet} defaultPath={defaultPath} />}
      />
    </FormProvider>
  );
}
