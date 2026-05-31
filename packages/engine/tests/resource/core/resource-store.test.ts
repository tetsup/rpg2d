import type { ZodType } from 'zod';
import type { ManifestData } from '@sharedTypes/resource/manifest';
import { ResourceStore } from '@engine/resource/core/resource-store';
import { GameContext } from '@engine/resource/core/game-context';
import { Action } from '@engine/resource/domain/action';
import { fetchJson } from '@engine/utils/http/fetch';

vi.mock('@engine/utils/http/fetch', () => ({
  fetchJson: vi.fn(),
}));

const fetchJsonMock = vi.mocked(fetchJson);

const actionResource = {
  namespace: 'sample',
  type: 'action',
  name: 'greeting',
  data: {
    sequence: [{ command: 'sendMessage', messages: ['hello'] }],
  },
};

const makeManifest = (): ManifestData =>
  ({
    initialState: {
      core: { players: [], variables: new Map(), mode: 'field' },
      field: {
        fieldId: 'sample/field/main',
        pos: { x: 0, y: 0 },
        direction: 'down',
        actionIds: [],
      },
    },
    schemas: { playerState: {} },
    config: {
      blockSize: { width: 16, height: 16 },
      textSize: { width: 8, height: 8 },
      moveDurationMs: 200,
      screen: { width: 320, height: 240 },
      defaultMessagePanel: 'sample/panel/main',
      messageConfig: { speedMs: 100, margin: { left: 2, right: 2, top: 1, bottom: 1 } },
    },
  }) as ManifestData;

const createStore = () => new ResourceStore(new GameContext(makeManifest(), { resourceUri: '/resource' }));

const mockFetchJsonResponse = (response: unknown) => {
  fetchJsonMock.mockImplementation(async (_req, schema: ZodType) => await schema.parseAsync(response));
};

describe('ResourceStore.get resource fetch contract', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('変更後構造の action レスポンスから Action インスタンスを生成できる', async () => {
    mockFetchJsonResponse(actionResource);

    await expect(createStore().get('sample/action/greeting', 'action')).resolves.toBeInstanceOf(Action);
  });

  it.each([
    ['data が存在しない', (({ data: _data, ...resource }) => resource)(actionResource)],
    ['namespace が存在しない', (({ namespace: _namespace, ...resource }) => resource)(actionResource)],
    ['type が存在しない', (({ type: _type, ...resource }) => resource)(actionResource)],
    ['name が存在しない', (({ name: _name, ...resource }) => resource)(actionResource)],
  ])('%s場合は reject される', async (_caseName, invalidResource) => {
    mockFetchJsonResponse(invalidResource);

    await expect(createStore().get('sample/action/greeting', 'action')).rejects.toThrow();
  });
});
