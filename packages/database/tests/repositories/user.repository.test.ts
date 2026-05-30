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

function createUserDocument(
  overrides: Partial<Omit<UserDocument, 'createdAt' | 'updatedAt'>> = {}
): UserDocument {
  const now = new Date();

  return {
    ...validUser,
    ...overrides,
    createdAt: now,
    updatedAt: now,
  };
}

describe('user repository integration', () => {
  beforeEach(async () => {
    await execute(async (tx) => {
      await userCollectionBuilder(tx).deleteMany({});
    });
  });

  describe('get', () => {
    beforeEach(async () => {
      await execute(async (tx) => {
        await userCollectionBuilder(tx).insertOne(createUserDocument());
      });
    });

    it('returns existing user', async () => {
      const result = await new UserRepository().get(validUser.sub);

      expect(result.ok).toBeTruthy();

      if (result.ok) {
        expect(result.data?.presenceName).toBe('Test User');
        expect(result.data?.roles).toEqual(['player']);
      }
    });
  });

  describe('update', () => {
    beforeEach(async () => {
      await execute(async (tx) => {
        await userCollectionBuilder(tx).insertOne(createUserDocument());
      });
    });

    it('updates user', async () => {
      const result = await new UserRepository().update({
        ...validUser,
        presenceName: 'Updated User',
        roles: ['admin'],
      });

      expect(result.ok).toBeTruthy();

      const user = await execute(async (tx) => {
        return await userCollectionBuilder(tx).findOne({ sub: validUser.sub });
      });

      expect(user?.presenceName).toBe('Updated User');
      expect(user?.roles).toEqual(['admin']);
    });
  });

  describe('upsert', () => {
    beforeEach(async () => {
      await execute(async (tx) => {
        await userCollectionBuilder(tx).insertOne(createUserDocument());
      });
    });

    it('updates existing user', async () => {
      const result = await new UserRepository().upsert({
        ...validUser,
        presenceName: 'Upserted User',
      });

      expect(result.ok).toBeTruthy();

      const user = await execute(async (tx) => {
        return await userCollectionBuilder(tx).findOne({ sub: validUser.sub });
      });

      expect(user?.presenceName).toBe('Upserted User');
    });
  });
});
