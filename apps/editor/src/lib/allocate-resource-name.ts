export const RESOURCE_NAME_INDEX_COUNT = 26 * 26;

export function resourceNameSuffixAt(index: number): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  return chars[Math.floor(index / 26)] + chars[index % 26];
}

export type AllocateResourceNameParams = {
  /** Naming parent (e.g. `hero`, `hero.down`). Omit for root allocation. */
  parent?: string;
  taken: ReadonlySet<string>;
  /** Dot-derived segment tried once (e.g. `down` → `hero.down`). */
  hint?: string;
  /** Cached scan start for hyphen indexes (aa..zz). */
  startIndex?: number;
};

export type AllocateResourceNameResult = {
  name: string;
  nextIndex: number;
};

export function allocateResourceName(params: AllocateResourceNameParams): AllocateResourceNameResult {
  const { parent, taken, hint, startIndex = 0 } = params;

  if (parent != null && parent !== '') {
    if (hint) {
      const dotted = `${parent}.${hint}`;
      if (!taken.has(dotted)) {
        return { name: dotted, nextIndex: startIndex };
      }
    }

    for (let i = startIndex; i < RESOURCE_NAME_INDEX_COUNT; i++) {
      const name = `${parent}-${resourceNameSuffixAt(i)}`;
      if (!taken.has(name)) {
        return { name, nextIndex: i + 1 };
      }
    }

    return allocateResourceName({
      parent: `${parent}.zz`,
      taken,
      startIndex: 0,
    });
  }

  if (hint) {
    if (!taken.has(hint)) {
      return { name: hint, nextIndex: startIndex };
    }

    for (let i = startIndex; i < RESOURCE_NAME_INDEX_COUNT; i++) {
      const name = `${hint}-${resourceNameSuffixAt(i)}`;
      if (!taken.has(name)) {
        return { name, nextIndex: i + 1 };
      }
    }

    return allocateResourceName({
      parent: `${hint}.zz`,
      taken,
      startIndex: 0,
    });
  }

  for (let i = startIndex; i < RESOURCE_NAME_INDEX_COUNT; i++) {
    const name = resourceNameSuffixAt(i);
    if (!taken.has(name)) {
      return { name, nextIndex: i + 1 };
    }
  }

  return allocateResourceName({
    parent: 'zz',
    taken,
    startIndex: 0,
  });
}

/** Simple in-memory cache: next hyphen-index to try per namespace/type/parent. */
export class ResourceNameAllocatorCache {
  private nextIndexByKey = new Map<string, number>();

  key(namespace: string, type: string, parent?: string) {
    return `${namespace}/${type}/${parent ?? ''}`;
  }

  getStartIndex(key: string) {
    return this.nextIndexByKey.get(key) ?? 0;
  }

  setNextIndex(key: string, nextIndex: number) {
    this.nextIndexByKey.set(key, nextIndex);
  }

  clear() {
    this.nextIndexByKey.clear();
  }
}

export const resourceNameAllocatorCache = new ResourceNameAllocatorCache();
