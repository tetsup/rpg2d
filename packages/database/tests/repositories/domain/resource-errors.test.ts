import { ZodError } from 'zod';
import { createResourceInputSchema } from '@schema/database/resource';
import { ResourceRepository } from '@database/repositories/resource';
import { createMockDb, createPgError } from './helpers/mock-db';
import { createPlayerDocument, validPlayerPath } from './helpers/fixtures';

const validDocument = createPlayerDocument();

describe('resource repository error mapping', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('get', () => {
    it('maps database_error', async () => {
      const chain = {
        select: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        executeTakeFirst: vi.fn().mockRejectedValue(createPgError('XX000')),
      };
      const resources = new ResourceRepository({
        mockDb: createMockDb({
          selectFrom: vi.fn(() => chain),
        }),
      });

      const result = await resources.get(validPlayerPath);

      expect(result.ok).toBeFalsy();
      expect(result.ok || result.reason).toBe('database_error');
    });

    it('maps unknown error', async () => {
      const chain = {
        select: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        executeTakeFirst: vi.fn().mockRejectedValue(new Error('unknown')),
      };
      const resources = new ResourceRepository({
        mockDb: createMockDb({
          selectFrom: vi.fn(() => chain),
        }),
      });

      const result = await resources.get(validPlayerPath);

      expect(result.ok).toBeFalsy();
      expect(result.ok || result.reason).toBe('unknown');
    });
  });

  describe('create', () => {
    it('maps validation_failed', async () => {
      const resources = new ResourceRepository({
        mockResourceInputSchema: () =>
          ({
            parse: vi.fn().mockImplementation(() => {
              throw new ZodError([]);
            }),
          }) as ReturnType<typeof createResourceInputSchema>,
      });
      const result = await resources.create(validPlayerPath, validDocument);

      expect(result.ok).toBeFalsy();
      expect(result.ok || result.reason).toBe('validation_failed');
    });

    it('maps already_exists', async () => {
      const chain = {
        values: vi.fn().mockReturnThis(),
        execute: vi.fn().mockRejectedValue(createPgError('23505')),
      };
      const resources = new ResourceRepository({
        mockDb: createMockDb({
          insertInto: vi.fn(() => chain),
        }),
      });
      const result = await resources.create(validPlayerPath, validDocument);

      expect(result.ok).toBeFalsy();
      expect(result.ok || result.reason).toBe('already_exists');
    });

    it('maps database_error', async () => {
      const chain = {
        values: vi.fn().mockReturnThis(),
        execute: vi.fn().mockRejectedValue(createPgError('40001')),
      };
      const resources = new ResourceRepository({
        mockDb: createMockDb({
          insertInto: vi.fn(() => chain),
        }),
      });
      const result = await resources.create(validPlayerPath, validDocument);

      expect(result.ok).toBeFalsy();
      expect(result.ok || result.reason).toBe('database_error');
    });

    it('maps unknown', async () => {
      const chain = {
        values: vi.fn().mockReturnThis(),
        execute: vi.fn().mockRejectedValue(new Error('unknown')),
      };
      const resources = new ResourceRepository({
        mockDb: createMockDb({
          insertInto: vi.fn(() => chain),
        }),
      });
      const result = await resources.create(validPlayerPath, validDocument);

      expect(result.ok).toBeFalsy();
      expect(result.ok || result.reason).toBe('unknown');
    });
  });

  describe('update', () => {
    it('maps validation_failed', async () => {
      const resources = new ResourceRepository({
        mockResourceInputSchema: () =>
          ({
            parse: vi.fn().mockImplementation(() => {
              throw new ZodError([]);
            }),
          }) as ReturnType<typeof createResourceInputSchema>,
      });
      const result = await resources.update(validPlayerPath, {} as object);

      expect(result.ok).toBeFalsy();
      expect(result.ok || result.reason).toBe('validation_failed');
    });

    it('maps database_error', async () => {
      const chain = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        executeTakeFirst: vi.fn().mockRejectedValue(createPgError('40001')),
      };
      const resources = new ResourceRepository({
        mockDb: createMockDb({
          updateTable: vi.fn(() => chain),
        }),
      });
      const result = await resources.update(validPlayerPath, validDocument);

      expect(result.ok).toBeFalsy();
      expect(result.ok || result.reason).toBe('database_error');
    });
  });

  describe('find', () => {
    it('maps database_error', async () => {
      const chain = {
        selectAll: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        execute: vi.fn().mockRejectedValue(createPgError('XX000')),
      };
      const resources = new ResourceRepository({
        mockDb: createMockDb({
          selectFrom: vi.fn(() => chain),
        }),
      });

      const result = await resources.find([], 'user', 'id');

      expect(result.ok).toBeFalsy();
      expect(result.ok || result.reason).toBe('database_error');
    });
  });

  describe('findIncomingReferences', () => {
    it('maps database_error', async () => {
      const chain = {
        selectAll: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        execute: vi.fn().mockRejectedValue(createPgError('XX000')),
      };
      const resources = new ResourceRepository({
        mockDb: createMockDb({
          selectFrom: vi.fn(() => chain),
        }),
      });
      const result = await resources.findIncomingReferences(validPlayerPath);

      expect(result.ok).toBeFalsy();
      expect(result.ok || result.reason).toBe('database_error');
    });
  });

  describe('delete', () => {
    it('maps database_error', async () => {
      const chain = {
        where: vi.fn().mockReturnThis(),
        executeTakeFirst: vi.fn().mockRejectedValue(createPgError('40001')),
      };
      const resources = new ResourceRepository({
        mockDb: createMockDb({
          deleteFrom: vi.fn(() => chain),
        }),
      });
      const result = await resources.delete(validPlayerPath);

      expect(result.ok).toBeFalsy();
      expect(result.ok || result.reason).toBe('database_error');
    });

    it('maps unknown', async () => {
      const chain = {
        where: vi.fn().mockReturnThis(),
        executeTakeFirst: vi.fn().mockRejectedValue(new Error('unknown')),
      };
      const resources = new ResourceRepository({
        mockDb: createMockDb({
          deleteFrom: vi.fn(() => chain),
        }),
      });
      const result = await resources.delete(validPlayerPath);

      expect(result.ok).toBeFalsy();
      expect(result.ok || result.reason).toBe('unknown');
    });
  });
});
