import { describe, expect, it } from 'vitest';
import { getResourceContextLabel } from '@editor/lib/graphics-context-label';

describe('getResourceContextLabel', () => {
  it('returns hyphen index segment', () => {
    expect(getResourceContextLabel('hero.down-aa')).toBe('aa');
  });

  it('returns dot suffix segment', () => {
    expect(getResourceContextLabel('hero.down')).toBe('down');
  });

  it('returns root name when no separator', () => {
    expect(getResourceContextLabel('hero')).toBe('hero');
  });
});
