import { AssetCache } from '@/resource/core/asset-cache';

const mockBitmap = {} as ImageBitmap;

const config = { resourceUri: '/api/resource', imageUri: '/api/image' };

const createCache = () => {
  const cache = new AssetCache(config);
  cache.setRenderer({
    registerImage: vi.fn(),
  } as any);

  return cache;
};

describe('assetCache', () => {
  beforeEach(() => {
    vi.resetAllMocks();

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        blob: vi.fn().mockResolvedValue(new Blob()),
      })
    );

    vi.stubGlobal('createImageBitmap', vi.fn().mockResolvedValue(mockBitmap));
  });

  it('未キャッシュ時はundefinedを返しcacheを開始する', () => {
    const cache = createCache();
    const spy = vi.spyOn(cache, 'cache');
    const result = cache.get('a');

    expect(result).toBeUndefined();
    expect(spy).toHaveBeenCalledWith('a');
  });

  it('cache後は画像を取得できる', async () => {
    const cache = createCache();
    await cache.cache('a');
    const result = cache.get('a');

    expect(result).toBe(mockBitmap);
  });

  it('loading中はundefinedを返す', async () => {
    let resolveFetch: any;

    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveFetch = resolve;
          })
      )
    );
    const cache = createCache();
    cache.cache('a');
    const result = cache.get('a');

    expect(result).toBeUndefined();

    resolveFetch({
      blob: async () => 'blob',
    });
    await Promise.resolve();
  });

  it('同一IDは1回しかfetchされない', () => {
    const cache = createCache();
    cache.get('a');
    cache.get('a');
    cache.get('a');

    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('cache成功時はloaded状態になる', async () => {
    const cache = createCache();
    await cache.cache('a');

    expect(cache.images.get('a')).toEqual({
      loaded: true,
      image: mockBitmap,
    });
  });

  it('fetch失敗時はキャッシュが削除される', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('fail')));
    const cache = createCache();
    await cache.cache('a');
    expect(cache.images.has('a')).toBe(false);
  });

  it('fetch失敗後は再度getで再fetchされる', async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce({
        blob: async () => 'blob',
      });
    vi.stubGlobal('fetch', fetchMock);

    const cache = createCache();
    await cache.cache('a');

    expect(cache.images.has('a')).toBe(false);

    cache.get('a');

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('読み込み成功時 renderer に登録される', async () => {
    const renderer = {
      registerImage: vi.fn(),
    };

    const cache = new AssetCache(config);
    cache.setRenderer(renderer as any);

    await cache.cache('a');

    expect(renderer.registerImage).toHaveBeenCalledWith({
      imageId: 'a',
      imageData: mockBitmap,
    });
  });

  it('renderer未初期化でcacheするとエラーになる', async () => {
    const cache = new AssetCache(config);

    await expect(cache.cache('a')).rejects.toThrow('renderer has not been initialized');
  });
});
