import type { FilterMap } from '@sharedTypes/database/filter';

function escapeLike(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_');
}

export function startsWith(pattern: string) {
  const escaped = escapeLike(pattern);
  return `%${escaped}`;
}

export function contains(pattern: string) {
  const escaped = escapeLike(pattern);
  return `%${escaped}%`;
}

import { Database } from '@sharedTypes/database/collection';
import { sql, type SelectQueryBuilder } from 'kysely';

export function applyFilter<T extends keyof FilterMap>(
  qb: SelectQueryBuilder<Database, T, any>,
  filter: Exclude<FilterMap[T][any], { name: 'q' }>
) {
  switch (filter.op) {
    case 'eq':
      return qb.where(filter.name, '=', filter.value);

    case 'ne':
      return qb.where(filter.name, '!=', filter.value);

    case 'lt':
      return qb.where(filter.name, '<', filter.value);

    case 'lte':
      return qb.where(filter.name, '<=', filter.value);

    case 'gt':
      return qb.where(filter.name, '>', filter.value);

    case 'gte':
      return qb.where(filter.name, '>=', filter.value);

    case 'in':
      return qb.where(filter.name, 'in', filter.value);

    case 'notIn':
      return qb.where(filter.name, 'not in', filter.value);

    case 'isNull':
      return qb.where(filter.name, 'is', null);

    case 'isNotNull':
      return qb.where(filter.name, 'is not', null);

    case 'startsWith': {
      return qb.where(
        sql<boolean>`
          ${sql.ref(filter.name)}
          ILIKE
          ${startsWith(filter.value)}
        `
      );
    }

    case 'contains': {
      return qb.where(
        sql<boolean>`
          ${sql.ref(filter.name)}
          ILIKE
          ${contains(filter.value)}
        `
      );
    }

    case 'match':
      return qb.where(
        sql<boolean>`
          to_tsvector('simple', ${sql.ref(filter.name)})
          @@
          plainto_tsquery('simple', ${filter.value})
        `
      );

    // JSONB @>
    case 'jsonContains':
      return qb.where(
        sql<boolean>`
          ${sql.ref(filter.name)}
          @>
          ${JSON.stringify(filter.value)}::jsonb
        `
      );

    // JSONB ?
    case 'hasKey':
      return qb.where(
        sql<boolean>`
          ${sql.ref(filter.name)}
          ?
          ${filter.value}
        `
      );

    // JSONB ?|
    case 'hasAnyKey':
      return qb.where(
        sql<boolean>`
          ${sql.ref(filter.name)}
          ?|
          ${sql`ARRAY[${sql.join(filter.value)}]`}
        `
      );

    // JSONB ?&
    case 'hasAllKeys':
      return qb.where(
        sql<boolean>`
          ${sql.ref(filter.name)}
          ?&
          ${sql`ARRAY[${sql.join(filter.value)}]`}
        `
      );

    // Range/GiST &&
    case 'overlap':
      return qb.where(
        sql<boolean>`
          ${sql.ref(filter.name)}
          &&
          ${filter.value}
        `
      );

    // Range/GiST <@
    case 'within':
      return qb.where(
        sql<boolean>`
          ${sql.ref(filter.name)}
          <@
          ${filter.value}
        `
      );

    default: {
      throw new Error(`Unsupported operator: ${JSON.stringify(filter)}`);
    }
  }
}
