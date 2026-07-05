import { ResourceStore } from '@engine/resource/core/resource-store';
import { GameContext } from '@engine/resource/core/game-context';
import { Action } from '@engine/resource/domain/action';
import type { FetchWithThrowParams } from '@engine/utils/http/fetch';
import { ManifestSchema } from '@schema/resource/manifest';
import { ResourceConfigSchema } from '@schema/config/resource-config';
import type { ManifestData } from '@sharedTypes/resource/manifest';
import type { ResourceConfig } from '@sharedTypes/config';

const actionResource = {
  id: 'sample/action/greet',
  namespace: 'sample',
  type: 'action',
  name: 'greet',
  version: 0,
  isDraft: false,
  data: {
    sequence: [{ command: 'sendMessage', messages: ['hello'] }],
  },
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  createdBy: 'test-user',
} as const;

const createManifest = (): ManifestData =>
  ManifestSchema.parse({
    initialState: {
      core: { players: [], variables: {}, mode: 'field' },
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

const createStoreWithFetchMock = (body: unknown) => {
  const ctx = new GameContext(createManifest(), createConfig());
  const fetchMock = vi.fn(createFetchFunc(body));
  const store = new ResourceStore(ctx, fetchMock as any);

  ctx.resources = store;

  return { store, fetchMock };
};

const withoutField = (field: keyof typeof actionResource): Record<string, unknown> => {
  const body: Record<string, unknown> = { ...actionResource };
  delete body[field];
  return body;
};

describe('ResourceStore + ResourceFactory resource fetch integration', () => {
  it('APIレスポンスのactionデータからActionインスタンスを生成できる', async () => {
    const store = createStore(actionResource);

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

  it('versionがない場合は失敗する', async () => {
    await expect(createStore(withoutField('version')).get('sample/action/greet', 'action')).rejects.toThrow();
  });

  it('versionが1の場合は失敗する', async () => {
    await expect(createStore({ ...actionResource, version: 1 }).get('sample/action/greet', 'action')).rejects.toThrow();
  });

  it('versionが文字列の場合は失敗する', async () => {
    await expect(
      createStore({ ...actionResource, version: '0' }).get('sample/action/greet', 'action')
    ).rejects.toThrow();
  });

  it('namespaceが要求したResourceIdと一致しない場合は失敗する', async () => {
    await expect(
      createStore({ ...actionResource, namespace: 'other' }).get('sample/action/greet', 'action')
    ).rejects.toThrow();
  });

  it('typeが要求したResourceIdと一致しない場合は失敗する', async () => {
    await expect(
      createStore({ ...actionResource, type: 'player' }).get('sample/action/greet', 'action')
    ).rejects.toThrow();
  });

  it('nameが要求したResourceIdと一致しない場合は失敗する', async () => {
    await expect(
      createStore({ ...actionResource, name: 'other' }).get('sample/action/greet', 'action')
    ).rejects.toThrow();
  });

  it('同じResourceIdを取得すると同じインスタンスを返す', async () => {
    const store = createStore(actionResource);

    const a = await store.get('sample/action/greet', 'action');
    const b = await store.get('sample/action/greet', 'action');

    expect(a).toBe(b);
  });

  it('同じResourceIdを2回取得してもfetchFuncは1回だけ呼ばれる', async () => {
    const { store, fetchMock } = createStoreWithFetchMock(actionResource);

    await store.get('sample/action/greet', 'action');
    await store.get('sample/action/greet', 'action');

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('fetchFuncが例外を投げる場合は失敗する', async () => {
    const ctx = new GameContext(createManifest(), createConfig());
    const store = new ResourceStore(ctx, async () => {
      throw new Error('fetch failed');
    });

    ctx.resources = store;

    await expect(store.get('sample/action/greet', 'action')).rejects.toThrow('fetch failed');
  });

  it('data配下のsequenceを読み取れる', async () => {
    const store = createStore(actionResource);

    const action = await store.get('sample/action/greet', 'action');

    expect(action.getSequence()).toEqual([
      {
        command: 'sendMessage',
        messages: ['hello'],
      },
    ]);
  });
});
