import { beforeEach, describe, expect, it, vi } from 'vitest';
import { resourceNameAllocatorCache } from '@editor/lib/allocate-resource-name';
import { reserveGraphicsResourceDraft } from '@editor/lib/reserve-graphics-resource';
import * as search from '@editor/hooks/api/search';
import * as mutations from '@editor/hooks/api/mutations';

describe('reserveGraphicsResourceDraft', () => {
  beforeEach(() => {
    resourceNameAllocatorCache.clear();
    vi.restoreAllMocks();
  });

  it('allocates a name and creates a draft resource', async () => {
    vi.spyOn(search, 'getDocumentList').mockResolvedValue({
      items: [{ name: 'aa' } as never],
      hasMore: false,
    });
    const createDocument = vi.spyOn(mutations, 'createDocument').mockResolvedValue(undefined);

    const result = await reserveGraphicsResourceDraft({
      namespace: 'sample',
      type: 'image',
      data: {
        size: { width: 8, height: 8 },
        palette: { ff: [0, 0, 0, 0] },
        pixels: Array(8).fill('ff '.repeat(8).trim()),
      },
    });

    expect(result).toEqual({ name: 'ab', id: 'sample/image/ab' });
    expect(createDocument).toHaveBeenCalledWith('resources', {
      namespace: 'sample',
      type: 'image',
      name: 'ab',
      version: 0,
      isDraft: true,
      data: expect.objectContaining({ size: { width: 8, height: 8 } }),
    });
    expect(resourceNameAllocatorCache.getStartIndex(resourceNameAllocatorCache.key('sample', 'image'))).toBe(2);
  });

  it('retries when create fails due to a race', async () => {
    vi.spyOn(search, 'getDocumentList').mockResolvedValue({ items: [], hasMore: false });
    const createDocument = vi
      .spyOn(mutations, 'createDocument')
      .mockRejectedValueOnce(new Error('duplicate'))
      .mockResolvedValueOnce(undefined);

    const result = await reserveGraphicsResourceDraft({
      namespace: 'sample',
      type: 'image',
      parent: 'hero.down',
      data: {
        size: { width: 8, height: 8 },
        palette: { ff: [0, 0, 0, 0] },
        pixels: Array(8).fill('ff '.repeat(8).trim()),
      },
    });

    expect(result.name).toBe('hero.down-ab');
    expect(createDocument).toHaveBeenCalledTimes(2);
  });
});
