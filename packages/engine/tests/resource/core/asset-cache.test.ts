import { describe, it, expect, vi, beforeEach } from 'vitest';

import { AssetCache } from '@engine/resource/core/asset-cache';
import { ResourceStore } from '@engine/resource/core/resource-store';
import { ImageLoader } from '@engine/resource/domain/imageLoader';

const mockBitmap = {} as ImageBitmap;

const createImageLoader = (): ImageLoader =>
  ({
    toBitmap: vi.fn().mockResolvedValue(mockBitmap),
  }) as unknown as ImageLoader;

const createStore = (loader = createImageLoader()): ResourceStore =>
  ({
    get: vi.fn().mockResolvedValue(loader),
  }) as unknown as ResourceStore;

const createCache = () => {
  const store = createStore();

  const cache = new AssetCache(store);

  cache.setRenderer({
    registerImage: vi.fn(),
  } as any);

  return { cache, store };
};

describe('assetCache', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('未キャッシュ時はundefinedを返しcacheを開始する', () => {
    const { cache } = createCache();

    const spy = vi.spyOn(cache, 'cache');

    const result = cache.get('a');

    expect(result).toBeUndefined();
    expect(spy).toHaveBeenCalledWith('a');
  });

  it('cache後は画像を取得できる', async () => {
    const { cache } = createCache();

    await cache.cache('a');

    const result = cache.get('a');

    expect(result).toBe(mockBitmap);
  });

  it('loading中はundefinedを返す', async () => {
    let resolveBitmap!: (value: ImageBitmap) => void;

    const loader = {
      toBitmap: vi.fn().mockImplementation(
        () =>
          new Promise<ImageBitmap>((resolve) => {
            resolveBitmap = resolve;
          })
      ),
    } as unknown as ImageLoader;

    const store = createStore(loader);

    const cache = new AssetCache(store);

    cache.setRenderer({
      registerImage: vi.fn(),
    } as any);

    cache.cache('a');

    const result = cache.get('a');

    expect(result).toBeUndefined();

    resolveBitmap(mockBitmap);

    await Promise.resolve();
  });

  it('同一IDは1回しかloadされない', () => {
    const { cache } = createCache();

    cache.get('a');
    cache.get('a');
    cache.get('a');

    expect(cache.images.size).toBe(1);
  });

  it('cache成功時はloaded状態になる', async () => {
    const { cache } = createCache();

    await cache.cache('a');

    expect(cache.images.get('a')).toEqual({
      loaded: true,
      image: mockBitmap,
    });
  });

  it('load失敗時はキャッシュが削除される', async () => {
    const loader = {
      toBitmap: vi.fn().mockRejectedValue(new Error('fail')),
    } as unknown as ImageLoader;

    const store = createStore(loader);

    const cache = new AssetCache(store);

    cache.setRenderer({
      registerImage: vi.fn(),
    } as any);

    await expect(cache.cache('a')).rejects.toThrow('fail');

    expect(cache.images.has('a')).toBe(false);
  });

  it('load失敗後は再度getで再loadされる', async () => {
    const loader = {
      toBitmap: vi.fn().mockRejectedValueOnce(new Error('fail')).mockResolvedValueOnce(mockBitmap),
    } as unknown as ImageLoader;

    const store = createStore(loader);

    const cache = new AssetCache(store);

    cache.setRenderer({
      registerImage: vi.fn(),
    } as any);

    await expect(cache.cache('a')).rejects.toThrow();

    expect(cache.images.has('a')).toBe(false);

    cache.get('a');

    expect(loader.toBitmap).toHaveBeenCalledTimes(2);
  });

  it('読み込み成功時 renderer に登録される', async () => {
    const renderer = {
      registerImage: vi.fn(),
    };

    const store = createStore();

    const cache = new AssetCache(store);

    cache.setRenderer(renderer as any);

    await cache.cache('a');

    expect(renderer.registerImage).toHaveBeenCalledWith({
      imageId: 'a',
      imageData: mockBitmap,
    });
  });

  it('renderer未初期化でcacheするとエラーになる', async () => {
    const store = createStore();

    const cache = new AssetCache(store);

    await expect(cache.cache('a')).rejects.toThrow('renderer has not been initialized');
  });
});
