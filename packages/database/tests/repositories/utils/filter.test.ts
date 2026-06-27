import { findWithCursor } from '@database/repositories/utils/filter';

describe('findWithCursor', () => {
  it('returns single page', async () => {
    const repository = {
      find: vi.fn().mockResolvedValue({
        ok: true,
        data: [{ id: 'a' }, { id: 'b' }],
      }),
    };

    const result = await findWithCursor({
      repository: repository as any,
      query: [],
      userId: 'user1',
      sortKey: 'id',
      chunkSize: 10,
    });

    expect(result.ok).toBe(true);

    if (!result.ok) return;

    expect(result.data).toEqual({
      items: [{ id: 'a' }, { id: 'b' }],
      hasMore: false,
      nextCursor: undefined,
    });
  });

  it('detects hasMore and nextCursor', async () => {
    const repository = {
      find: vi.fn().mockResolvedValue({
        ok: true,
        data: [{ id: 'a' }, { id: 'b' }, { id: 'c' }],
      }),
    };

    const result = await findWithCursor({
      repository: repository as any,
      query: [],
      userId: 'user1',
      sortKey: 'id',
      chunkSize: 2,
    });

    expect(result.ok).toBe(true);

    if (!result.ok) return;

    expect(result.data.items).toEqual([{ id: 'a' }, { id: 'b' }]);

    expect(result.data.hasMore).toBe(true);
    expect(result.data.nextCursor).toBe('b');
  });

  it('adds cursor filter', async () => {
    const repository = {
      find: vi.fn().mockResolvedValue({
        ok: true,
        data: [],
      }),
    };

    await findWithCursor({
      repository: repository as any,
      query: [],
      userId: 'user1',
      sortKey: 'id',
      cursor: 'bbb',
      chunkSize: 10,
    });

    expect(repository.find).toHaveBeenCalledWith(
      [
        {
          name: 'id',
          op: 'gt',
          value: 'bbb',
        },
      ],
      'user1',
      'id',
      11,
      { fetchMode: 'cursor_probe' }
    );
  });

  it('preserves existing query when adding cursor', async () => {
    const repository = {
      find: vi.fn().mockResolvedValue({
        ok: true,
        data: [],
      }),
    };

    const query = [
      {
        name: 'type',
        op: 'eq',
        value: 'skill',
      },
    ];

    await findWithCursor({
      repository: repository as any,
      query: query as any,
      userId: 'user1',
      sortKey: 'id',
      cursor: 'bbb',
      chunkSize: 10,
    });

    expect(repository.find).toHaveBeenCalledWith(
      [
        {
          name: 'type',
          op: 'eq',
          value: 'skill',
        },
        {
          name: 'id',
          op: 'gt',
          value: 'bbb',
        },
      ],
      'user1',
      'id',
      11,
      { fetchMode: 'cursor_probe' }
    );
  });

  it('passes repository errors through', async () => {
    const repository = {
      find: vi.fn().mockResolvedValue({
        ok: false,
        error: 'boom',
      }),
    };

    const result = await findWithCursor({
      repository: repository as any,
      query: [],
      userId: 'user1',
      sortKey: 'id',
      chunkSize: 10,
    });

    expect(result).toEqual({
      ok: false,
      error: 'boom',
    });
  });
});
