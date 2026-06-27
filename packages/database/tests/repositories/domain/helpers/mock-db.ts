import { DatabaseError } from 'pg';
import { vi } from 'vitest';
import type { Kysely } from 'kysely';
import type { Database } from '@sharedTypes/database/collection';

type QueryChain = {
  selectAll: () => QueryChain;
  select: () => QueryChain;
  where: () => QueryChain;
  orderBy: () => QueryChain;
  limit: () => QueryChain;
  executeTakeFirst: ReturnType<typeof vi.fn>;
  execute: ReturnType<typeof vi.fn>;
};

function createQueryChain(overrides: Partial<QueryChain> = {}): QueryChain {
  const chain: QueryChain = {
    selectAll: vi.fn(),
    select: vi.fn(),
    where: vi.fn(),
    orderBy: vi.fn(),
    limit: vi.fn(),
    executeTakeFirst: vi.fn(),
    execute: vi.fn(),
  };

  chain.selectAll.mockReturnValue(chain);
  chain.select.mockReturnValue(chain);
  chain.where.mockReturnValue(chain);
  chain.orderBy.mockReturnValue(chain);
  chain.limit.mockReturnValue(chain);

  return { ...chain, ...overrides };
}

export function createMockDb(overrides: {
  selectFrom?: ReturnType<typeof vi.fn>;
  insertInto?: ReturnType<typeof vi.fn>;
  updateTable?: ReturnType<typeof vi.fn>;
  deleteFrom?: ReturnType<typeof vi.fn>;
} = {}): Kysely<Database> {
  const defaultChain = createQueryChain();

  return {
    selectFrom: overrides.selectFrom ?? vi.fn(() => defaultChain),
    insertInto:
      overrides.insertInto ??
      vi.fn(() => ({
        values: vi.fn(() => ({
          execute: vi.fn(),
          onConflict: vi.fn(() => ({
            column: vi.fn(() => ({
              doUpdateSet: vi.fn(() => ({
                execute: vi.fn(),
              })),
            })),
          })),
        })),
      })),
    updateTable:
      overrides.updateTable ??
      vi.fn(() => ({
        set: vi.fn(() => ({
          where: vi.fn(() => ({
            execute: vi.fn(),
            executeTakeFirst: vi.fn(),
          })),
        })),
      })),
    deleteFrom:
      overrides.deleteFrom ??
      vi.fn(() => ({
        where: vi.fn(() => ({
          execute: vi.fn(),
          executeTakeFirst: vi.fn(),
        })),
      })),
    transaction: vi.fn(() => ({
      execute: vi.fn((fn: (trx: Kysely<Database>) => unknown) => fn({} as Kysely<Database>)),
    })),
  } as unknown as Kysely<Database>;
}

export function createPgError(code: string, message = 'database error') {
  const error = new DatabaseError(message, 0, 'error');
  error.code = code;
  return error;
}

export { createQueryChain };
