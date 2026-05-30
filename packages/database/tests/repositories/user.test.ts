import { execute } from '@database/client/mongo-client';
import { userCollectionBuilder } from '@database/collections/users';
import { UserRepository } from '@database/repositories/user';
import type { UserDocument } from '@database/types/collection';

const validUser: Omit<UserDocument, 'createdAt' | 'updatedAt'> = {
  sub: 'auth0|user',
  presenceName: 'Test User',
  email: 'user@example.com',
  avatar: 'https://example.com/avatar.png',
  roles: ['player'],
};

describe('user repository', () => {
  beforeEach(async () => {
    await execute(async (tx) => {
      await userCollectionBuilder(tx).deleteMany({});
    });
  });

  describe('upsert', () => {
    it('creates new user', async () => {
      const result = await new UserRepository().upsert(validUser);

      expect(result.ok).toBeTruthy();

      const user = await execute(async (tx) => {
        return await userCollectionBuilder(tx).findOne({ sub: validUser.sub });
      });

      expect(user?.presenceName).toBe('Test User');
      expect(user?.roles).toEqual(['player']);
    });
  });
});
