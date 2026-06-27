import { ZodError } from 'zod';
import { UserDocumentSchema } from '@schema/database/user';
import { UserRepository } from '@database/repositories/user';
import { createMockDb, createPgError } from './helpers/mock-db';
import { createUserInput } from './helpers/fixtures';

const validUser = createUserInput();

describe('user repository error mapping', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('get', () => {
    it('maps database_error', async () => {
      const chain = {
        selectAll: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        executeTakeFirst: vi.fn().mockRejectedValue(createPgError('40001')),
      };
      const users = new UserRepository({
        mockDb: createMockDb({
          selectFrom: vi.fn(() => chain),
        }),
      });

      const result = await users.get(validUser.id);

      expect(result.ok).toBeFalsy();

      if (!result.ok) {
        expect(result.reason).toBe('database_error');
      }
    });

    it('maps unknown', async () => {
      const chain = {
        selectAll: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        executeTakeFirst: vi.fn().mockRejectedValue(new Error('unknown')),
      };
      const users = new UserRepository({
        mockDb: createMockDb({
          selectFrom: vi.fn(() => chain),
        }),
      });

      const result = await users.get(validUser.id);

      expect(result.ok).toBeFalsy();

      if (!result.ok) {
        expect(result.reason).toBe('unknown');
      }
    });
  });

  describe('update', () => {
    it('maps validation_failed', async () => {
      const users = new UserRepository({
        mockSchema: {
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
      const chain = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        execute: vi.fn().mockRejectedValue(createPgError('23505')),
      };
      const users = new UserRepository({
        mockDb: createMockDb({
          updateTable: vi.fn(() => chain),
        }),
      });

      const result = await users.update(validUser);

      expect(result.ok).toBeFalsy();

      if (!result.ok) {
        expect(result.reason).toBe('already_exists');
      }
    });

    it('maps database_error', async () => {
      const chain = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        execute: vi.fn().mockRejectedValue(createPgError('XX000')),
      };
      const users = new UserRepository({
        mockDb: createMockDb({
          updateTable: vi.fn(() => chain),
        }),
      });

      const result = await users.update(validUser);

      expect(result.ok).toBeFalsy();

      if (!result.ok) {
        expect(result.reason).toBe('database_error');
      }
    });

    it('maps unknown', async () => {
      const chain = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        execute: vi.fn().mockRejectedValue(new Error('unknown')),
      };
      const users = new UserRepository({
        mockDb: createMockDb({
          updateTable: vi.fn(() => chain),
        }),
      });

      const result = await users.update(validUser);

      expect(result.ok).toBeFalsy();

      if (!result.ok) {
        expect(result.reason).toBe('unknown');
      }
    });
  });
});
