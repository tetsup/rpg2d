import { useMemo, useState } from 'react';
import type { useImageData } from './use-image-data';
import type { useScreen } from './use-screen';
import { useZoomTool } from './use-zoom-tool';
import { usePaletteTool } from './use-palette-tool';
import { useHandTool } from './use-hand-tool';
import { usePenTool } from './use-pen-tool';

type UseToolSetProps = {
  screen: ReturnType<typeof useScreen>;
  image: ReturnType<typeof useImageData>;
};

type ToolMode = 'pen' | 'hand';

export const useToolSet = ({ screen, image }: UseToolSetProps) => {
  const [mode, setMode] = useState<ToolMode>('pen');
  const paletteTool = usePaletteTool({ image });
  const zoomTool = useZoomTool({ screen });
  const penTool = usePenTool({ screen, image, paletteTool });
  const handTool = useHandTool({ screen });
  const tools = useMemo(
    () => ({
      pen: penTool,
      hand: handTool,
    }),
    [penTool, handTool]
  );

  return {
    setMode,
    penTool,
    handTool,
    paletteTool,
    zoomTool,
    mode,
    pointerHandlers: tools[mode]?.pointerHandlers,
  };
};
