import { ResourceInput } from '@sharedTypes/database/collection';

export function buildManifestData(data: Partial<ResourceInput<'manifest'>['data']>): ResourceInput<'manifest'>['data'] {
  return {
    initialState: {
      core: { players: [], variables: {}, mode: 'field' },
      field: { fieldId: null, pos: { x: 0, y: 0 }, direction: 'down', actionIds: [] },
    },
    schemas: { playerState: {} },
    config: {
      blockSize: { width: 16, height: 16 },
      textSize: { width: 7, height: 7 },
      moveDurationMs: 500,
      screen: { width: 320, height: 240 },
      defaultMessagePanel: null,
      messageConfig: { speedMs: 100, margin: { left: 0, top: 0, right: 1, bottom: 1 } },
    },
    ...data,
  };
}
