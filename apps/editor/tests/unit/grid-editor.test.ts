import { act, renderHook } from '@testing-library/react';
import { usePenTool } from '@editor/hooks/grid-editor/pen-tool';

describe('usePenTool', () => {
  it('ドラッグしたセルを描画し、pointerUpでcommitする', () => {
    const image = {
      setPixel: vi.fn(),
      commit: vi.fn(),
    };

    const paletteTool = {
      selectedPaletteKey: '01',
    };

    const screen = {
      createPointerHandler: vi.fn((handlers) => handlers),
    };

    const { result } = renderHook(() =>
      usePenTool({
        image: image as any,
        screen: screen as any,
        paletteTool: paletteTool as any,
      })
    );

    expect(screen.createPointerHandler).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.pointerHandlers.onPointerDown({
        grid: { x: 1, y: 2 },
      } as any);

      result.current.pointerHandlers.onPointerMove({
        grid: { x: 2, y: 2 },
      } as any);

      result.current.pointerHandlers.onPointerMove({
        grid: { x: 3, y: 2 },
      } as any);

      result.current.pointerHandlers.onPointerUp({
        grid: { x: 3, y: 2 },
      } as any);
    });

    expect(image.setPixel).toHaveBeenNthCalledWith(1, { x: 1, y: 2 }, '01');

    expect(image.setPixel).toHaveBeenNthCalledWith(2, { x: 2, y: 2 }, '01');

    expect(image.setPixel).toHaveBeenNthCalledWith(3, { x: 3, y: 2 }, '01');

    expect(image.commit).toHaveBeenCalledTimes(1);
  });
});
