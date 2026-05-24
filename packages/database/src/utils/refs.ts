export function extractResourceRefs(value: unknown): string[] {
  const refs = new Set<string>();

  function walk(current: unknown) {
    if (typeof current === 'string') {
      if (current.includes('/')) {
        refs.add(current);
      }
      return;
    }

    if (Array.isArray(current)) {
      current.forEach(walk);
      return;
    }

    if (current && typeof current === 'object') {
      Object.values(current).forEach(walk);
    }
  }
  walk(value);
  return [...refs];
}
