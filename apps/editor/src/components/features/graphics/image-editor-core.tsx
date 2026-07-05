import type { ResourceRecord } from '@sharedTypes/database/collection';
import { PixelCanvas } from '@editor/components/features/graphics/pixel-canvas';
import { isPaintMode, type OperationMode } from '@editor/lib/paint-editor/operation-mode';
import type { ImagePixelData } from '@editor/lib/pixel-render';

export type ImageEditorCoreSlots = {
  canvas: React.ReactNode;
  canvasWidth: number;
  canvasHeight: number;
};

type ImageEditorCoreProps = {
  draftData: ImagePixelData | null | undefined;
  selectedToken: string;
  onPaint?: (x: number, y: number) => void;
  emptyLabel: string;
  operationMode: OperationMode;
};

export function renderImageEditorCore(props: ImageEditorCoreProps): ImageEditorCoreSlots {
  const { draftData, selectedToken, onPaint, emptyLabel, operationMode } = props;
  const editable = draftData != null && onPaint != null && isPaintMode(operationMode);

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
        onPaint={editable ? onPaint : undefined}
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
