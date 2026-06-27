import {
  clampDbFetchLimit,
  clampPageSize,
  CURSOR_PROBE_EXTRA_ROWS,
  DB_FETCH_LIMIT_MAX,
  PAGE_SIZE_DEFAULT,
  PAGE_SIZE_MAX,
  PAGE_SIZE_MIN,
  resolveDbFetchLimit,
} from '@database/repositories/utils/limits';

describe('repository limits', () => {
  describe('clampPageSize', () => {
    it('uses the default when size is omitted', () => {
      expect(clampPageSize()).toBe(PAGE_SIZE_DEFAULT);
    });

    it('clamps to the minimum', () => {
      expect(clampPageSize(0)).toBe(PAGE_SIZE_MIN);
      expect(clampPageSize(-5)).toBe(PAGE_SIZE_MIN);
    });

    it('clamps to the maximum', () => {
      expect(clampPageSize(PAGE_SIZE_MAX + 10)).toBe(PAGE_SIZE_MAX);
    });

    it('floors fractional values', () => {
      expect(clampPageSize(2.9)).toBe(2);
    });
  });

  describe('clampDbFetchLimit', () => {
    it('clamps direct fetches to the page-size range', () => {
      expect(clampDbFetchLimit(0, 'direct')).toBe(PAGE_SIZE_MIN);
      expect(clampDbFetchLimit(10, 'direct')).toBe(10);
      expect(clampDbFetchLimit(PAGE_SIZE_MAX + 5, 'direct')).toBe(PAGE_SIZE_MAX);
    });

    it('allows one extra row for cursor probing', () => {
      expect(clampDbFetchLimit(PAGE_SIZE_MIN, 'cursor_probe')).toBe(PAGE_SIZE_MIN + CURSOR_PROBE_EXTRA_ROWS);
      expect(clampDbFetchLimit(PAGE_SIZE_MAX + CURSOR_PROBE_EXTRA_ROWS, 'cursor_probe')).toBe(DB_FETCH_LIMIT_MAX);
      expect(clampDbFetchLimit(DB_FETCH_LIMIT_MAX + 5, 'cursor_probe')).toBe(DB_FETCH_LIMIT_MAX);
    });
  });

  describe('resolveDbFetchLimit', () => {
    it('normalizes direct find limits through clampPageSize', () => {
      expect(resolveDbFetchLimit(2)).toBe(2);
      expect(resolveDbFetchLimit(undefined)).toBe(PAGE_SIZE_DEFAULT);
    });

    it('preserves cursor probe limits without re-clamping page size', () => {
      expect(resolveDbFetchLimit(3, { fetchMode: 'cursor_probe' })).toBe(3);
      expect(resolveDbFetchLimit(DB_FETCH_LIMIT_MAX, { fetchMode: 'cursor_probe' })).toBe(DB_FETCH_LIMIT_MAX);
    });
  });
});
