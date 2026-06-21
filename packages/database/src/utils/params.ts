const API_MAX_LIMIT = 100;
const API_DEFAULT_LIMIT = 50;

export function resolveLimit(limit?: number, allowNext: boolean = false) {
  return Math.min(API_MAX_LIMIT + (allowNext ? 1 : 0), limit ?? API_DEFAULT_LIMIT);
}
