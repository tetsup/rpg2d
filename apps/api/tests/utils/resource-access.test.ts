import { Action } from '@api/utils/authorize';
import { ensureResourceAccess } from '@api/utils/resource-access';
import { ApiError, ForbiddenError, NotFoundError, UnauthorizedError } from '@api/errors/http-error';
import type { UserDocument } from '@sharedTypes/database/collection';
import type { RepositoryResult } from '@database/repositories/utils/common';

const user: UserDocument = {
  id: 'user-a',
  presenceName: 'User A',
  email: 'a@example.com',
  avatar: '',
  isAdmin: false,
  roles: [],
};

const path = { namespace: 'sample', type: 'player', name: 'hero' } as const;

const getCreatedBy = vi.fn<() => Promise<RepositoryResult<string>>>();
const authorize = vi.fn();

vi.mock('@database/repositories/resource', () => ({
  ResourceRepository: class {
    getCreatedBy = getCreatedBy;
  },
}));

vi.mock('@api/utils/authorize', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@api/utils/authorize')>();
  return {
    ...actual,
    authorize: (...args: unknown[]) => authorize(...args),
  };
});

describe('ensureResourceAccess', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authorize.mockResolvedValue(undefined);
  });

  it('throws UnauthorizedError when user is missing', async () => {
    await expect(ensureResourceAccess(undefined, path, Action.READ)).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it('throws NotFoundError when updating a missing resource', async () => {
    getCreatedBy.mockResolvedValue({ ok: false, reason: 'not_found' });

    await expect(ensureResourceAccess(user, path, Action.UPDATE)).rejects.toBeInstanceOf(NotFoundError);
  });

  it('throws ApiError when ownership lookup fails unexpectedly', async () => {
    getCreatedBy.mockResolvedValue({ ok: false, reason: 'database_error' });

    await expect(ensureResourceAccess(user, path, Action.DELETE)).rejects.toBeInstanceOf(ApiError);
    await expect(ensureResourceAccess(user, path, Action.DELETE)).rejects.toMatchObject({ status: 503 });
  });

  it('throws ForbiddenError when authorize rejects', async () => {
    getCreatedBy.mockResolvedValue({ ok: true, data: 'other-user' });
    authorize.mockRejectedValue(new ForbiddenError());

    await expect(ensureResourceAccess(user, path, Action.UPDATE)).rejects.toBeInstanceOf(ForbiddenError);
  });

  it('loads ownership before authorizing updates', async () => {
    getCreatedBy.mockResolvedValue({ ok: true, data: user.id });

    await expect(ensureResourceAccess(user, path, Action.UPDATE)).resolves.toBe(user);
    expect(authorize).toHaveBeenCalledWith(user, path.namespace, Action.UPDATE, user.id);
  });

  it('authorizes reads without loading ownership', async () => {
    await expect(ensureResourceAccess(user, path, Action.READ)).resolves.toBe(user);
    expect(getCreatedBy).not.toHaveBeenCalled();
    expect(authorize).toHaveBeenCalledWith(user, path.namespace, Action.READ);
  });
});
