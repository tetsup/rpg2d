import { useEffect, useMemo, useState } from 'react';
import { createResourceInputSchema } from '@schema/database/resource';
import type { ResourceRecord } from '@sharedTypes/database/collection';
import { PalettePanel } from '@editor/components/features/graphics/palette-panel';
import { PixelCanvas } from '@editor/components/features/graphics/pixel-canvas';
import { ToolBar } from '@editor/components/features/graphics/toolbar';
import { getDefaultPaletteToken, setImagePixel } from '@editor/lib/image-pixel-mutate';

export type ImageEditorCoreSlots = {
  canvas: React.ReactNode;
  toolbar: React.ReactNode;
  palette: React.ReactNode;
};

/** Call from a component keyed by `resource?.id` so state resets on frame change. */
export function useImageEditorState(
  resource: ResourceRecord<'image'> | undefined,
  onDirtyChange?: (dirty: boolean) => void
) {
  const [draftData, setDraftData] = useState(() => resource?.data);
  const [isDraft, setIsDraft] = useState(() => resource?.isDraft ?? true);
  const [selectedToken, setSelectedToken] = useState(() =>
    resource ? getDefaultPaletteToken(resource.data.palette) : 'ff'
  );

  const isDirty = useMemo(() => {
    if (resource == null || draftData == null) return false;
    return isDraft !== resource.isDraft || JSON.stringify(draftData) !== JSON.stringify(resource.data);
  }, [draftData, isDraft, resource]);

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
      description: resource.description,
      isDraft,
      data: draftData,
    });
  }, [draftData, isDraft, resource]);

  return {
    resource,
    draftData,
    isDraft,
    setIsDraft,
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
};

export function renderImageEditorCore(props: ImageEditorCoreProps): ImageEditorCoreSlots {
  const { state, emptyLabel } = props;
  const { draftData, selectedToken, setDraftData, setSelectedToken } = state;

  if (draftData == null) {
    return {
      canvas: <PixelCanvas className="w-full" emptyLabel={emptyLabel} />,
      toolbar: <ToolBar />,
      palette: <PalettePanel />,
    };
  }

  return {
    canvas: (
      <PixelCanvas
        className="w-full"
        image={draftData}
        activeToken={selectedToken}
        onPaint={(x, y) => {
          setDraftData((current) => (current ? setImagePixel(current, x, y, selectedToken) : current));
        }}
      />
    ),
    toolbar: <ToolBar />,
    palette: (
      <PalettePanel
        palette={draftData.palette}
        selectedToken={selectedToken}
        onSelectToken={setSelectedToken}
      />
    ),
  };
}
