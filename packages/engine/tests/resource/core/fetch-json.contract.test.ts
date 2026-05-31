import { GameContext } from '@engine/resource/core/game-context';
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

const expectIsoString = (value: unknown) => {
  expect(typeof value).toBe('string');
  expect(new Date(value as string).toISOString()).toBe(value);
};

describe('resource fetch contract', () => {
  beforeEach(() => {
    vi.mocked(fetchJson).mockReset();
  });

  it('passes a new YAML-shaped resource payload through ResourceFactory.create', async () => {
    const payload = {
      namespace: 'sample',
      type: 'action',
      name: 'welcome.v0',
      version: 0,
      createdAt: timestamp,
      updatedAt: timestamp,
      data: {
        sequence: [
          {
            command: 'sendMessage',
            messages: ['welcome'],
          },
        ],
      },
    };

    vi.mocked(fetchJson).mockResolvedValue(payload);

    const ctx = createContext();
    const createSpy = vi.spyOn(ctx.factory, 'create');

    const resource = await ctx.resources.get(actionId, 'action');

    expect(fetchJson).toHaveBeenCalledWith(`${resourceUri}/${actionId}`, expect.anything());
    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        namespace: 'sample',
        type: 'action',
        name: 'welcome.v0',
      }),
      'action'
    );

    const data = (resource as any).data;

    expect(data).toEqual(
      expect.objectContaining({
        namespace: 'sample',
        type: 'action',
        name: 'welcome.v0',
        version: 0,
      })
    );
    expectIsoString(data.createdAt);
    expectIsoString(data.updatedAt);
    expect(data.data).toEqual({
      sequence: [
        {
          command: 'sendMessage',
          messages: ['welcome'],
        },
      ],
    });
  });
});
