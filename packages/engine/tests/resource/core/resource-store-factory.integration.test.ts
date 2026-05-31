import { ResourceStore } from '@engine/resource/core/resource-store';
import { GameContext } from '@engine/resource/core/game-context';
import { Action } from '@engine/resource/domain/action';
import type { FetchWithThrowParams } from '@engine/utils/http/fetch';
import { ManifestSchema } from '@schema/resource/manifest';
import { ResourceConfigSchema } from '@schema/config/resource-config';
import type { ManifestData } from '@sharedTypes/resource/manifest';
import type { ResourceConfig } from '@sharedTypes/config';

const actionDocument = {
  namespace: 'sample',
  type: 'action',
  name: 'greet',
  data: {
    sequence: [{ command: 'sendMessage', messages: ['hello'] }],
  },
} as const;

const createManifest = (): ManifestData =>
  ManifestSchema.parse({
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
      defaultMessagePanel: 'sample/panel/message',
      messageConfig: { speedMs: 100, margin: { left: 2, right: 2, top: 1, bottom: 1 } },
    },
  });

const createConfig = (): ResourceConfig =>
  ResourceConfigSchema.parse({ resourceUri: 'https://example.test/resources' });

const createFetchFunc =
  (body: unknown) =>
  async <T>({ parser }: FetchWithThrowParams<T>): Promise<T> =>
    parser(
      new Response(JSON.stringify(body), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
    );

const createStore = (body: unknown): ResourceStore => {
  const ctx = new GameContext(createManifest(), createConfig());
  const store = new ResourceStore(ctx, createFetchFunc(body));
  ctx.resources = store;
  return store;
};

const withoutField = (field: keyof typeof actionDocument): Record<string, unknown> => {
  const body: Record<string, unknown> = { ...actionDocument };
  delete body[field];
  return body;
};

describe('ResourceStore + ResourceFactory resource fetch integration', () => {
  it('APIレスポンスのactionデータからActionインスタンスを生成できる', async () => {
    const store = createStore(actionDocument);

    const action = await store.get('sample/action/greet', 'action');

    expect(action).toBeInstanceOf(Action);
  });

  it('namespaceがない場合は失敗する', async () => {
    await expect(createStore(withoutField('namespace')).get('sample/action/greet', 'action')).rejects.toThrow();
  });

  it('typeがない場合は失敗する', async () => {
    await expect(createStore(withoutField('type')).get('sample/action/greet', 'action')).rejects.toThrow();
  });

  it('nameがない場合は失敗する', async () => {
    await expect(createStore(withoutField('name')).get('sample/action/greet', 'action')).rejects.toThrow();
  });

  it('dataがない場合は失敗する', async () => {
    await expect(createStore(withoutField('data')).get('sample/action/greet', 'action')).rejects.toThrow();
  });

  it('fetchFuncが例外を投げる場合は失敗する', async () => {
    const ctx = new GameContext(createManifest(), createConfig());
    const store = new ResourceStore(ctx, async () => {
      throw new Error('fetch failed');
    });

    ctx.resources = store;

    await expect(store.get('sample/action/greet', 'action')).rejects.toThrow('fetch failed');
  });
});
