import type { FieldState, LayerWithPos } from '@sharedTypes/engine';
import type { ManifestData } from '@sharedTypes/resource/manifest';
import type { GameContext } from '@engine/resource/core/game-context';
import type { Field } from '@engine/resource/domain/field';
import { shiftPos } from '@engine/utils/pos';
import { Rect } from '@engine/utils/rect';

export const resolvePlayerLayers = (
  nowMs: number,
  viewport: Rect,
  state: FieldState,
  config: ManifestData['config']
): LayerWithPos[] => {
  return state.players.flatMap((player) => {
    const globalPos = state.playerPos.getCurrentPixel(nowMs);
    const screenPos = shiftPos(globalPos, viewport.topLeft);
    const rect = Rect.fromTopLeft(screenPos, config.blockSize);
    return player.skin.resolveLayers(nowMs, state.playerPos.direction).map((layer) => ({ rect, layer }));
  });
};

export const resolveEntitiesLayers = (
  nowMs: number,
  viewport: Rect,
  state: FieldState,
  config: ManifestData['config']
): LayerWithPos[] => {
  return Object.values(state.entities)
    .filter((entity) => entity.state.visible)
    .map((entity) => {
      const rect = Rect.fromTopLeft(entity.state.pos.getCurrentPixel(nowMs), config.blockSize);
      return { rect, entity };
    })
    .filter(({ rect }) => rect.overwrap(viewport))
    .flatMap(({ rect, entity }) => {
      const screenRect = rect.relational(viewport.topLeft);
      const layers = entity.resolveLayers(nowMs);
      return layers.map((layer) => ({ rect: screenRect, layer }));
    });
};

export const retrieveLayers = (
  nowMs: number,
  viewport: Rect,
  state: FieldState,
  config: ManifestData['config'],
  field: Field
): LayerWithPos[] => {
  const playerLayers = resolvePlayerLayers(nowMs, viewport, state, config);
  const entityLayers = resolveEntitiesLayers(nowMs, viewport, state, config);
  const tileLayers = field.resolveLayers(nowMs, viewport);
  return [...playerLayers, ...entityLayers, ...tileLayers];
};

export const sortLayers = (layers: LayerWithPos[]) => layers.sort((a, b) => a.layer.priority - b.layer.priority);

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
