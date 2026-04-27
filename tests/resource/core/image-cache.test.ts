import { AssetCache } from '@/resource/core/asset-cache';

const mockBitmap = {} as ImageBitmap;

const config = { resourceUri: 'http://localhost:5173/api/resource' };

describe('assetCache', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        blob: vi.fn().mockResolvedValue('blob'),
      } as any)
    );
    vi.stubGlobal('createImageBitmap', vi.fn().mockResolvedValue(mockBitmap));
  });

  it('未キャッシュ時はundefinedを返しcacheを開始する', () => {
    const cache = new AssetCache(config);
    const spy = vi.spyOn(cache, 'cache');
    const result = cache.get('a');

    expect(result).toBeUndefined();
    expect(spy).toHaveBeenCalledWith('a');
  });

  it('cache後は画像を取得できる', async () => {
    const cache = new AssetCache(config);
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
    const cache = new AssetCache(config);
    cache.cache('a');
    const result = cache.get('a');

    expect(result).toBeUndefined();

    resolveFetch({
      blob: async () => 'blob',
    });
    await Promise.resolve();
  });

  it('同一IDは1回しかfetchされない', () => {
    const cache = new AssetCache(config);
    cache.get('a');
    cache.get('a');
    cache.get('a');

    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('cache成功時はloaded状態になる', async () => {
    const cache = new AssetCache(config);
    await cache.cache('a');

    expect(cache.images.get('a')).toEqual({
      loaded: true,
      image: mockBitmap,
    });
  });

  it('fetch失敗時はキャッシュが削除される', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('fail')));
    const cache = new AssetCache(config);
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

    const cache = new AssetCache(config);
    await cache.cache('a');

    expect(cache.images.has('a')).toBe(false);

    cache.get('a');

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
