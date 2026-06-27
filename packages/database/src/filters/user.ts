import type { SelectQueryBuilder } from 'kysely';
import type { Database } from '@sharedTypes/database/collection';
import type { FilterMap } from '@sharedTypes/database/filter';
import { applyFilter, contains, startsWith } from './utils';

export function applyUserFilter(qb: SelectQueryBuilder<Database, 'users', any>, filters: FilterMap['users'][]) {
  for (const filter of filters) {
    if (filter.name === 'q')
      qb = qb.where((eb) =>
        eb.or([
          eb('id', 'like', startsWith(filter.value)),
          eb('presenceName', 'like', startsWith(filter.value)),
          eb('email', 'like', contains(filter.value)),
        ])
      );
    else qb = qb.where(applyFilter(qb, filter));
  }
  return qb;
}
