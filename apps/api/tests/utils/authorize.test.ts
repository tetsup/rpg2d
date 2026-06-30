import { Action, createAuthorize } from '@api/utils/authorize';
import { ForbiddenError } from '@api/errors/http-error';
import type { UserDocument } from '@sharedTypes/database/collection';

const user: UserDocument = {
  id: 'user-a',
  presenceName: 'User A',
  email: 'a@example.com',
  avatar: '',
  isAdmin: false,
};

function mockAuthorize(capabilities: {
  read: boolean;
  create: boolean;
  update: boolean;
  admin: boolean;
}) {
  return createAuthorize({
    checkPermissions: async () => ({ ok: true as const, data: capabilities }),
  });
}

describe('authorize', () => {
  it('allows admin users through global admin check', async () => {
    const authorize = mockAuthorize({
      read: false,
      create: false,
      update: false,
      admin: false,
    });

    await expect(
      authorize({ ...user, isAdmin: true }, 'sample', Action.UPDATE, 'other-user')
    ).resolves.toBeUndefined();
  });

  it('allows creators to update their own resources', async () => {
    const authorize = mockAuthorize({
      read: true,
      create: true,
      update: false,
      admin: false,
    });

    await expect(authorize(user, 'sample', Action.UPDATE, user.id)).resolves.toBeUndefined();
  });

  it('denies creators from updating resources owned by others', async () => {
    const authorize = mockAuthorize({
      read: true,
      create: true,
      update: false,
      admin: false,
    });

    await expect(authorize(user, 'sample', Action.UPDATE, 'other-user')).rejects.toBeInstanceOf(ForbiddenError);
  });

  it('allows editors to update resources owned by others', async () => {
    const authorize = mockAuthorize({
      read: true,
      create: true,
      update: true,
      admin: false,
    });

    await expect(authorize(user, 'sample', Action.UPDATE, 'other-user')).resolves.toBeUndefined();
  });

  it('denies readers from creating resources', async () => {
    const authorize = mockAuthorize({
      read: true,
      create: false,
      update: false,
      admin: false,
    });

    await expect(authorize(user, 'sample', Action.CREATE)).rejects.toBeInstanceOf(ForbiddenError);
  });
});
