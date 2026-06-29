import { Action, createAuthorize } from '@api/utils/authorize';
import { createEnsureResourceAccess } from '@api/utils/resource-access';
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

function createAccess(options: {
  createdBy?: RepositoryResult<string>;
  capabilities: { read: boolean; create: boolean; update: boolean; admin: boolean };
}) {
  return createEnsureResourceAccess({
    getCreatedBy: async () => options.createdBy ?? { ok: true, data: user.id },
    authorize: createAuthorize({
      checkPermissions: async () => ({ ok: true as const, data: options.capabilities }),
    }),
  });
}

describe('ensureResourceAccess', () => {
  it('throws UnauthorizedError when user is missing', async () => {
    const ensure = createAccess({
      capabilities: { read: true, create: true, update: true, admin: false },
    });

    await expect(ensure(undefined, path, Action.READ)).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it('throws NotFoundError when updating a missing resource', async () => {
    const ensure = createAccess({
      createdBy: { ok: false, reason: 'not_found' },
      capabilities: { read: true, create: true, update: true, admin: false },
    });

    await expect(ensure(user, path, Action.UPDATE)).rejects.toBeInstanceOf(NotFoundError);
  });

  it('throws ApiError when ownership lookup fails unexpectedly', async () => {
    const ensure = createAccess({
      createdBy: { ok: false, reason: 'database_error' },
      capabilities: { read: true, create: true, update: true, admin: false },
    });

    await expect(ensure(user, path, Action.DELETE)).rejects.toBeInstanceOf(ApiError);
    await expect(ensure(user, path, Action.DELETE)).rejects.toMatchObject({ status: 503 });
  });

  it('throws ForbiddenError when a creator updates another users resource', async () => {
    const ensure = createAccess({
      createdBy: { ok: true, data: 'other-user' },
      capabilities: { read: true, create: true, update: false, admin: false },
    });

    await expect(ensure(user, path, Action.UPDATE)).rejects.toBeInstanceOf(ForbiddenError);
  });

  it('allows a creator to update their own resource', async () => {
    const ensure = createAccess({
      createdBy: { ok: true, data: user.id },
      capabilities: { read: true, create: true, update: false, admin: false },
    });

    await expect(ensure(user, path, Action.UPDATE)).resolves.toBeUndefined();
  });

  it('allows read when namespace read is granted', async () => {
    const ensure = createAccess({
      capabilities: { read: true, create: false, update: false, admin: false },
    });

    await expect(ensure(user, path, Action.READ)).resolves.toBeUndefined();
  });
});
