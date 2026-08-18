import type { TileData } from '@sharedTypes/resource/tile';

export function buildTileData(data: Partial<TileData> = {}): TileData {
  return {
    texture: '',
    allowOverwrap: true,
    ...data,
  };
}
