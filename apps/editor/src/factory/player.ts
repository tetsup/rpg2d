import type { PlayerData } from '@sharedTypes/resource/player';

export function buildPlayerData(data: Partial<PlayerData> = {}): PlayerData {
  return { name: { type: 'input', input: {} }, initialSkin: '', initialState: {}, ...data };
}
