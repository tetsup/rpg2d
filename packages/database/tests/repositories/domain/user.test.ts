import { describe, it, beforeEach } from '@tests/setup/integration-test';
import { execute } from '@database/client/pg-client';
import { UserRepository } from '@database/repositories/user';
import { clearTables } from './helpers/db';
import { createUserInput, insertUser } from './helpers/fixtures';

const validUser = createUserInput();

describe('user repository integration', () => {
  beforeEach(async () => {
    await clearTables();
  });

  describe('get', () => {
    beforeEach(async () => {
      await insertUser();
    });

    it('returns existing user', async () => {
      const result = await new UserRepository().get(validUser.id);

      expect(result.ok).toBeTruthy();

      if (result.ok) {
        expect(result.data?.presenceName).toBe('Test User');
        expect(result.data?.isAdmin).toBe(false);
      }
    });
  });

  describe('update', () => {
    beforeEach(async () => {
      await insertUser();
    });

    it('updates user', async () => {
      const result = await new UserRepository().update({
        ...validUser,
        presenceName: 'Updated User',
        isAdmin: true,
      });

      expect(result.ok).toBeTruthy();

      const user = await execute(async (db) => {
        return await db.selectFrom('users').selectAll().where('id', '=', validUser.id).executeTakeFirst();
      });

      expect(user?.presenceName).toBe('Updated User');
      expect(user?.isAdmin).toBe(true);
    });
  });

  describe('upsert', () => {
    it('updates existing user', async () => {
      await insertUser();

      const result = await new UserRepository().upsert({
        ...validUser,
        presenceName: 'Upserted User',
      });

      expect(result.ok).toBeTruthy();

      const user = await execute(async (db) => {
        return await db.selectFrom('users').selectAll().where('id', '=', validUser.id).executeTakeFirst();
      });

      expect(user?.presenceName).toBe('Upserted User');
    });

    it('creates new user', async () => {
      const result = await new UserRepository().upsert(validUser);

      expect(result.ok).toBeTruthy();

      const user = await execute(async (db) => {
        return await db.selectFrom('users').selectAll().where('id', '=', validUser.id).executeTakeFirst();
      });

      expect(user?.presenceName).toBe('Test User');
      expect(user?.isAdmin).toBe(false);
    });
  });
});
