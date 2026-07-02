import { describe, expect, it } from 'vitest';
import { generateGraphicsResourceName } from '@editor/lib/graphics-resource-name';

describe('generateGraphicsResourceName', () => {
  it('builds a schema-valid name with type prefix and v0 suffix', () => {
    const name = generateGraphicsResourceName('image');

    expect(name).toMatch(/^image\.[a-z0-9]+\.v0$/);
  });

  it('generates unique names across calls', () => {
    const first = generateGraphicsResourceName('texture');
    const second = generateGraphicsResourceName('texture');

    expect(first).not.toBe(second);
  });
});
