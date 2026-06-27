import type { SelectQueryBuilder } from 'kysely';
import type { Database } from '@sharedTypes/database/collection';
import type { FilterMap } from '@sharedTypes/database/filter';
import { applyFilter, contains, startsWith } from './utils';

export function applyNamespaceFilter(
  qb: SelectQueryBuilder<Database, 'namespaces', any>,
  filters: FilterMap['namespaces'][]
) {
  for (const filter of filters) {
    if (filter.name === 'q')
      qb = qb.where((eb) =>
        eb.or([
          eb('id', 'like', startsWith(filter.value)),
          eb('presenceName', 'like', startsWith(filter.value)),
          eb('description', 'like', contains(filter.value)),
        ])
      );
    else qb = applyFilter(qb, filter);
  }
  return qb;
}
