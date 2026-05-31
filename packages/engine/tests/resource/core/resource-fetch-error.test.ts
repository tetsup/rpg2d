import { GameContext } from '@engine/resource/core/game-context';
import { Action } from '@engine/resource/domain/action';
import { fetchJson } from '@engine/utils/http/fetch';
import type { ResourceConfig } from '@sharedTypes/config';
import type { ManifestData } from '@sharedTypes/resource/manifest';

vi.mock('@engine/utils/http/fetch', () => ({
  fetchJson: vi.fn(),
}));

const actionId = 'sample/action/welcome.v0';
const resourceUri = 'mock://resources';
const timestamp = '2026-05-31T02:38:38.467Z';

const createContext = (config: ResourceConfig = { resourceUri }): GameContext =>
  new GameContext(
    {
      initialState: {
        core: { players: [], variables: new Map(), mode: 'field' },
        field: { fieldId: 'sample/field/start-field.v0', pos: { x: 0, y: 0 }, direction: 'down', actionIds: [] },
      },
      schemas: { playerState: {} },
      config: {
        blockSize: { width: 16, height: 16 },
        textSize: { width: 8, height: 8 },
        moveDurationMs: 200,
        screen: { width: 320, height: 240 },
        defaultMessagePanel: 'sample/panel/message.v0',
        messageConfig: { speedMs: 100, margin: { left: 2, right: 2, top: 1, bottom: 1 } },
      },
    } as ManifestData,
    config
  );

describe('resource fetch errors', () => {
  beforeEach(() => {
    vi.mocked(fetchJson).mockReset();
  });

  it.each([
    {
      name: 'missing namespace/type/name',
      body: {
        version: 0,
        createdAt: timestamp,
        updatedAt: timestamp,
        data: { sequence: [] },
      },
    },
    {
      name: 'missing data',
      body: {
        namespace: 'sample',
        type: 'action',
        name: 'welcome.v0',
        version: 0,
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    },
    {
      name: 'invalid structure',
      body: {
        namespace: 'sample',
        type: 'action',
        name: 'welcome.v0',
        version: '0',
        createdAt: timestamp,
        updatedAt: timestamp,
        data: null,
      },
    },
  ])('throws during schema.parse for $name', async ({ body }) => {
    vi.mocked(fetchJson).mockResolvedValue(body);

    const ctx = createContext();
    const loadDepsSpy = vi.spyOn(Action, 'loadDeps');

    await expect(ctx.resources.get(actionId, 'action')).rejects.toThrow();
    expect(loadDepsSpy).not.toHaveBeenCalled();
  });
});
