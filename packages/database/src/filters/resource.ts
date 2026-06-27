import type { SelectQueryBuilder } from 'kysely';
import type { Database } from '@sharedTypes/database/collection';
import type { FilterMap } from '@sharedTypes/database/filter';
import { applyFilter, contains, startsWith } from './utils';

export function applyResourceFilter(
  qb: SelectQueryBuilder<Database, 'resources', any>,
  filters: FilterMap['resources'][]
) {
  for (const filter of filters) {
    if (filter.name === 'q')
      qb = qb.where((eb) =>
        eb.or([
          eb('id', 'like', contains(filter.value)),
          eb('name', 'like', startsWith(filter.value)),
          eb('description', 'like', contains(filter.value)),
        ])
      );
    else applyFilter(qb, filter);
  }
  return qb;
}
