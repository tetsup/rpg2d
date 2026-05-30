import type { Collection } from 'mongodb';
import { MongoNetworkError, MongoServerError } from 'mongodb';
import { ZodError } from 'zod';
import { UserRepository } from '@database/repositories/user';
import { UserDocumentSchema } from '@database/schemas/user';
import type { UserDocument } from '@database/types/collection';

const validUser: Omit<UserDocument, 'createdAt' | 'updatedAt'> = {
  sub: 'auth0|user',
  presenceName: 'Test User',
  email: 'user@example.com',
  avatar: 'https://example.com/avatar.png',
  roles: ['player'],
};

describe('user repository error mapping', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('get', () => {
    it('maps network_error', async () => {
      const users = new UserRepository({
        mockCollectionBuilder: () =>
          ({
            findOne: vi.fn().mockRejectedValue(new MongoNetworkError('network')),
          }) as unknown as Collection<UserDocument>,
      });

      const result = await users.get(validUser.sub);

      expect(result.ok).toBeFalsy();

      if (!result.ok) {
        expect(result.reason).toBe('network_error');
      }
    });

    it('maps unknown', async () => {
      const users = new UserRepository({
        mockCollectionBuilder: () =>
          ({
            findOne: vi.fn().mockRejectedValue(new Error('unknown')),
          }) as unknown as Collection<UserDocument>,
      });

      const result = await users.get(validUser.sub);

      expect(result.ok).toBeFalsy();

      if (!result.ok) {
        expect(result.reason).toBe('unknown');
      }
    });
  });

  describe('update', () => {
    it('maps validation_failed', async () => {
      const users = new UserRepository({
        mockDocumentSchema: {
          parse: vi.fn(() => {
            throw new ZodError([]);
          }),
        } as unknown as typeof UserDocumentSchema,
      });

      const result = await users.update(validUser);

      expect(result.ok).toBeFalsy();

      if (!result.ok) {
        expect(result.reason).toBe('validation_failed');
      }
    });

    it('maps already_exists', async () => {
      const error = new MongoServerError({
        message: 'duplicate',
      });
      error.code = 11000;
      const users = new UserRepository({
        mockCollectionBuilder: () =>
          ({
            updateOne: vi.fn().mockRejectedValue(error),
          }) as unknown as Collection<UserDocument>,
      });

      const result = await users.update(validUser);

      expect(result.ok).toBeFalsy();

      if (!result.ok) {
        expect(result.reason).toBe('already_exists');
      }
    });

    it('maps database_error', async () => {
      const error = new MongoServerError({
        message: 'timeout',
      });
      error.code = 50;
      const users = new UserRepository({
        mockCollectionBuilder: () =>
          ({
            updateOne: vi.fn().mockRejectedValue(error),
          }) as unknown as Collection<UserDocument>,
      });

      const result = await users.update(validUser);

      expect(result.ok).toBeFalsy();

      if (!result.ok) {
        expect(result.reason).toBe('database_error');
      }
    });

    it('maps network_error', async () => {
      const users = new UserRepository({
        mockCollectionBuilder: () =>
          ({
            updateOne: vi.fn().mockRejectedValue(new MongoNetworkError('network')),
          }) as unknown as Collection<UserDocument>,
      });

      const result = await users.update(validUser);

      expect(result.ok).toBeFalsy();

      if (!result.ok) {
        expect(result.reason).toBe('network_error');
      }
    });
  });
});
