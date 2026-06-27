import {
  clampPageSize,
  CURSOR_PROBE_EXTRA_ROWS,
  DB_FETCH_LIMIT_MAX,
  PAGE_SIZE_DEFAULT,
  PAGE_SIZE_MAX,
} from '../repositories/utils/limits';

export { CURSOR_PROBE_EXTRA_ROWS, PAGE_SIZE_DEFAULT, PAGE_SIZE_MAX, DB_FETCH_LIMIT_MAX } from '../repositories/utils/limits';

export function resolveLimit(limit?: number, allowNext: boolean = false) {
  const pageSize = clampPageSize(limit);
  return allowNext ? Math.min(DB_FETCH_LIMIT_MAX, pageSize + CURSOR_PROBE_EXTRA_ROWS) : pageSize;
}
