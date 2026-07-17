import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ResourcePath } from '@sharedTypes/resource/common';
import { ImageData } from '@sharedTypes/resource/image';
import { ResourceInput } from '@sharedTypes/database/collection';
import { ResourceInputSchemaMap } from '@schema/database/resource';
import { useScreen } from '@editor/hooks/grid-editor/screen';
import { useImageData } from '@editor/hooks/grid-editor/image-data';
import { useToolSet } from '@editor/hooks/grid-editor/tool-set';
import { ImageToolbar } from './image-toolbar';

type ImageEditorProps = {
  defaultValues: ResourceInput<'image'>;
  defaultPath?: ResourcePath;
};

export function ImageEditor({ defaultValues, defaultPath }: ImageEditorProps) {
  const form = useForm({
    defaultValues,
    resolver: zodResolver(ResourceInputSchemaMap['image']),
    mode: 'all',
  });
  const image = useImageData({
    defaultValue: defaultValues.data as ImageData,
    onCommit: (data) => form.setValue('data', data),
  });
  const screen = useScreen({ image, cellSize: { width: 1, height: 1 } });
  const toolSet = useToolSet({ image, screen });

  return (
    <div className="flex h-full min-h-0 flex-col">
      <section className="relative flex min-h-0 flex-1 flex-col">
        <div ref={screen.containerRef} className="relative size-full overflow-hidden touch-none">
          <canvas ref={screen.canvasRef} className="absolute inset-0 size-full block [image-rendering:pixelated]" />
          <canvas className="absolute inset-0 size-full block touch-none" {...toolSet.pointerHandlers} />
        </div>
      </section>
      <footer className="shrink-0 border-t border-border bg-background px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <FormProvider {...form}>
          <ImageToolbar toolSet={toolSet} defaultPath={defaultPath} />
        </FormProvider>
      </footer>
    </div>
  );
}
