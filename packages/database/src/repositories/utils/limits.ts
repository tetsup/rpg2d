/** Minimum rows returned to callers (`find` limit / `chunkSize`). */
export const PAGE_SIZE_MIN = 1;

/** Maximum rows returned to callers. Shared by direct `find` and cursor paging. */
export const PAGE_SIZE_MAX = 100;

/** Extra rows fetched only for cursor `hasMore` detection. */
export const CURSOR_PROBE_EXTRA_ROWS = 1 as const;

/** Absolute SQL `LIMIT` ceiling when probing for the next cursor page. */
export const DB_FETCH_LIMIT_MAX = PAGE_SIZE_MAX + CURSOR_PROBE_EXTRA_ROWS;

/** Default page size when `find` is called without an explicit limit. */
export const PAGE_SIZE_DEFAULT = 50;

export type DbFetchMode = 'direct' | 'cursor_probe';

export function clampPageSize(size?: number, fallback: number = PAGE_SIZE_DEFAULT): number {
  return Math.max(PAGE_SIZE_MIN, Math.min(Math.floor(size ?? fallback), PAGE_SIZE_MAX));
}

export function clampDbFetchLimit(requested: number, mode: DbFetchMode): number {
  const floor = mode === 'cursor_probe' ? PAGE_SIZE_MIN + CURSOR_PROBE_EXTRA_ROWS : PAGE_SIZE_MIN;
  const ceiling = mode === 'cursor_probe' ? DB_FETCH_LIMIT_MAX : PAGE_SIZE_MAX;
  return Math.max(floor, Math.min(Math.floor(requested), ceiling));
}

export type FindOptions = {
  fetchMode?: DbFetchMode;
};

export function resolveDbFetchLimit(limit: number | undefined, options?: FindOptions): number {
  const mode = options?.fetchMode ?? 'direct';

  if (mode === 'cursor_probe') {
    return clampDbFetchLimit(limit ?? PAGE_SIZE_DEFAULT + CURSOR_PROBE_EXTRA_ROWS, 'cursor_probe');
  }

  return clampDbFetchLimit(clampPageSize(limit), 'direct');
}
