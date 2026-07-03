import { describe, expect, it, beforeEach } from 'vitest';
import {
  allocateResourceName,
  resourceNameAllocatorCache,
  resourceNameSuffixAt,
} from '@editor/lib/allocate-resource-name';

describe('resourceNameSuffixAt', () => {
  it('returns aa, ab, ac in order', () => {
    expect(resourceNameSuffixAt(0)).toBe('aa');
    expect(resourceNameSuffixAt(1)).toBe('ab');
    expect(resourceNameSuffixAt(2)).toBe('ac');
  });
});

describe('allocateResourceName', () => {
  it('uses dot hint once under a parent', () => {
    const taken = new Set<string>();
    expect(allocateResourceName({ parent: 'hero', taken, hint: 'down' })).toEqual({
      name: 'hero.down',
      nextIndex: 0,
    });
  });

  it('uses hyphen indexes under a parent', () => {
    const taken = new Set(['hero.down']);
    expect(allocateResourceName({ parent: 'hero.down', taken })).toEqual({
      name: 'hero.down-aa',
      nextIndex: 1,
    });
    expect(allocateResourceName({ parent: 'hero.down', taken: new Set(['hero.down', 'hero.down-aa']) })).toEqual({
      name: 'hero.down-ab',
      nextIndex: 2,
    });
  });

  it('uses the same index scan for duplicate allocation', () => {
    const taken = new Set(['hero.down-aa', 'hero.down-ab']);
    expect(allocateResourceName({ parent: 'hero.down', taken })).toEqual({
      name: 'hero.down-ac',
      nextIndex: 3,
    });
  });

  it('restarts hyphen indexes under parent.zz after zz', () => {
    const taken = new Set<string>();
    for (let i = 0; i < 676; i++) {
      taken.add(`hero.down-${resourceNameSuffixAt(i)}`);
    }
    expect(allocateResourceName({ parent: 'hero.down', taken })).toEqual({
      name: 'hero.down.zz-aa',
      nextIndex: 1,
    });
  });

  it('allocates root hint then hyphen indexes', () => {
    const taken = new Set(['hero']);
    expect(allocateResourceName({ taken, hint: 'hero' })).toEqual({
      name: 'hero-aa',
      nextIndex: 1,
    });
  });

  it('allocates bare aa..zz at root without hint', () => {
    const taken = new Set<string>();
    expect(allocateResourceName({ taken })).toEqual({ name: 'aa', nextIndex: 1 });
    expect(allocateResourceName({ taken: new Set(['aa']) })).toEqual({ name: 'ab', nextIndex: 2 });
  });

  it('respects startIndex cache hint', () => {
    const taken = new Set<string>();
    expect(allocateResourceName({ parent: 'hero.down', taken, startIndex: 2 })).toEqual({
      name: 'hero.down-ac',
      nextIndex: 3,
    });
  });
});

describe('resourceNameAllocatorCache', () => {
  beforeEach(() => {
    resourceNameAllocatorCache.clear();
  });

  it('stores next index per namespace/type/parent', () => {
    const key = resourceNameAllocatorCache.key('sample', 'image', 'hero.down');
    expect(resourceNameAllocatorCache.getStartIndex(key)).toBe(0);
    resourceNameAllocatorCache.setNextIndex(key, 4);
    expect(resourceNameAllocatorCache.getStartIndex(key)).toBe(4);
  });
});
