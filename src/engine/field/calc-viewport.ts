import type { FieldState } from '@/types/engine';
import { Rect } from '@/utils/rect';
import type { GameContext } from '@/resource/core/game-context';

export const calcViewPort = (nowMs: number, state: FieldState, ctx: GameContext) => {
  const anchorLeftTop = state.playerPos.getCurrentPixel(nowMs);
  const cameraCenter = {
    x: anchorLeftTop.x + (ctx.manifest.config.blockSize.width >> 1),
    y: anchorLeftTop.y + (ctx.manifest.config.blockSize.height >> 1),
  };
  const width = ctx.manifest.config.screen.width;
  const height = ctx.manifest.config.screen.height;
  return new Rect(cameraCenter.x - (width >> 1), cameraCenter.y - (height >> 1), width, height);
};
