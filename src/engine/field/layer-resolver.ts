import type { FieldState, LayerWithPos } from '@/types/engine';
import type { Manifest } from '@/schemas/manifest';
import { Rect } from '@/utils/rect';
import type { Field } from '@/resource/domain/field';
import { shiftPos } from '@/utils/pos';

export const resolvePlayerLayers = (
  nowMs: number,
  viewport: Rect,
  state: FieldState,
  config: Manifest['config']
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
  config: Manifest['config']
): LayerWithPos[] => {
  return Object.entries(state.entities)
    .filter(([_, entity]) => entity.state.visible)
    .map(([_, entity]) => {
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
  config: Manifest['config'],
  field: Field
): LayerWithPos[] => {
  const playerLayers = resolvePlayerLayers(nowMs, viewport, state, config);
  const entityLayers = resolveEntitiesLayers(nowMs, viewport, state, config);
  const tileLayers = field.resolveLayers(nowMs, viewport);
  return [...playerLayers, ...entityLayers, ...tileLayers];
};

export const sortLayers = (layers: LayerWithPos[]) => layers.sort((a, b) => a.layer.priority - b.layer.priority);
