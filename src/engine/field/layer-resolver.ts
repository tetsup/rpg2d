import type { FieldState } from '@/types/engine';
import type { Manifest } from '@/schemas/manifest';
import { Rect } from '@/utils/rect';
import type { Field } from '@/resource/domain/field';

export const resolvePlayerLayers = (nowMs: number, state: FieldState, config: Manifest['config']) => {
  return state.players.flatMap((player) => {
    const rect = Rect.fromTopLeft(state.playerPos.getCurrentPixel(nowMs), config.blockSize);
    return player.skin.resolveLayers(nowMs, state.playerPos.direction).map((layer) => ({ rect, layer }));
  });
};

export const resolveEntitiesLayers = (
  nowMs: number,
  viewport: Rect,
  state: FieldState,
  config: Manifest['config']
) => {
  return Object.entries(state.entities)
    .filter(([_, entity]) => entity.state.visible)
    .map(([_, entity]) => {
      const rect = Rect.fromTopLeft(entity.state.pos.getCurrentPixel(nowMs), config.blockSize);
      return { rect, entity };
    })
    .filter(({ rect }) => rect.overwrap(viewport))
    .map(({ rect, entity }) => {
      const layers = entity.resolveLayers(nowMs);
      return layers.map((layer) => ({ rect, layer }));
    })
    .flat(1);
};

export const retrieveLayers = (nowMs: number, viewport: Rect, state: FieldState, config: Manifest['config'], field: Field) => {
  const playerLayers = resolvePlayerLayers(nowMs, state, config);
  const entityLayers = resolveEntitiesLayers(nowMs, viewport, state, config);
  const tileLayers = field.resolveLayers(nowMs, viewport);
  return [...playerLayers, ...entityLayers, ...tileLayers];
};
