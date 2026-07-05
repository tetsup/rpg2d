import { useEffect, useMemo, useState } from 'react';
import { createResourceInputSchema } from '@schema/database/resource';
import type { ResourceRecord } from '@sharedTypes/database/collection';
import { PixelCanvas } from '@editor/components/features/graphics/pixel-canvas';
import { isPaintMode, type OperationMode } from '@editor/lib/paint-editor/operation-mode';
import { getDefaultPaletteToken, setImagePixel } from '@editor/lib/image-pixel-mutate';

export type ImageEditorCoreSlots = {
  canvas: React.ReactNode;
  canvasWidth: number;
  canvasHeight: number;
};

/** Call from a component keyed by `resource?.id` so state resets on frame change. */
export function useImageEditorState(
  resource: ResourceRecord<'image'> | undefined,
  onDirtyChange?: (dirty: boolean) => void
) {
  const [draftData, setDraftData] = useState(() => resource?.data);
  const [isDraft, setIsDraft] = useState(() => resource?.isDraft ?? true);
  const [description, setDescription] = useState(() => resource?.description ?? '');
  const [selectedToken, setSelectedToken] = useState(() =>
    resource ? getDefaultPaletteToken(resource.data.palette) : 'ff'
  );

  const isDirty = useMemo(() => {
    if (resource == null || draftData == null) return false;
    return (
      isDraft !== resource.isDraft ||
      description !== (resource.description ?? '') ||
      JSON.stringify(draftData) !== JSON.stringify(resource.data)
    );
  }, [draftData, description, isDraft, resource]);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const validation = useMemo(() => {
    if (resource == null || draftData == null) return null;
    return createResourceInputSchema('image').safeParse({
      namespace: resource.namespace,
      type: 'image',
      name: resource.name,
      version: resource.version,
      description,
      isDraft,
      data: draftData,
    });
  }, [draftData, description, isDraft, resource]);

  return {
    resource,
    draftData,
    isDraft,
    setIsDraft,
    description,
    setDescription,
    selectedToken,
    setSelectedToken,
    setDraftData,
    isDirty,
    validation,
  };
}

type ImageEditorCoreProps = {
  state: ReturnType<typeof useImageEditorState>;
  emptyLabel: string;
  operationMode: OperationMode;
};

export function renderImageEditorCore(props: ImageEditorCoreProps): ImageEditorCoreSlots {
  const { state, emptyLabel, operationMode } = props;
  const { draftData, selectedToken, setDraftData } = state;
  const editable = draftData != null && isPaintMode(operationMode);

  if (draftData == null) {
    return {
      canvas: <PixelCanvas className="w-full" emptyLabel={emptyLabel} />,
      canvasWidth: 0,
      canvasHeight: 0,
    };
  }

  return {
    canvas: (
      <PixelCanvas
        className="w-full"
        image={draftData}
        activeToken={selectedToken}
        onPaint={
          editable
            ? (x, y) => {
                setDraftData((current) =>
                  current ? setImagePixel(current, x, y, selectedToken) : current
                );
              }
            : undefined
        }
      />
    ),
    canvasWidth: draftData.size.width,
    canvasHeight: draftData.size.height,
  };
}

export function buildColorSwatchItems(
  palette: ResourceRecord<'image'>['data']['palette'] | undefined,
  selectedToken?: string
) {
  if (palette == null) return [];
  return Object.entries(palette).map(([token, rgba]) => ({
    key: token,
    label: token,
    swatch: (
      <span className="block size-full" style={{ backgroundColor: `rgba(${rgba.join(',')})` }} />
    ),
    isDirty: token === selectedToken,
  }));
}
