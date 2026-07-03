import { ZodError } from 'zod';
import {
  formatResourceId,
  IdSchema,
  parseResourceId,
  ResourcePathSchema,
} from '@schema/resource/common/base';

describe('ResourcePathSchema', () => {
  describe('success', () => {
    it('parses a simple path', () => {
      const input = {
        namespace: 'sample',
        type: 'player',
        name: 'hero',
      };

      expect(ResourcePathSchema.parse(input)).toEqual(input);
    });

    it('allows dotted resource names', () => {
      const input = {
        namespace: 'test',
        type: 'image',
        name: 'image.mr46a88v1.v0',
      };

      expect(ResourcePathSchema.parse(input)).toEqual(input);
    });

    it('allows fixture-style names', () => {
      const input = {
        namespace: 'sample',
        type: 'image',
        name: 'hero.down1.v0',
      };

      expect(ResourcePathSchema.parse(input)).toEqual(input);
    });

    it('allows hyphens and dots in namespace', () => {
      const input = {
        namespace: 'sample-test',
        type: 'player',
        name: 'hero',
      };

      expect(ResourcePathSchema.parse(input)).toEqual(input);
    });
  });

  describe('namespace validation', () => {
    it('rejects namespace starting with a digit', () => {
      expect(() =>
        ResourcePathSchema.parse({
          namespace: '1sample',
          type: 'player',
          name: 'hero',
        })
      ).toThrow(ZodError);
    });
  });

  describe('type validation', () => {
    it('rejects unknown type', () => {
      expect(() =>
        ResourcePathSchema.parse({
          namespace: 'sample',
          type: 'invalid-type',
          name: 'hero',
        })
      ).toThrow(ZodError);
    });
  });

  describe('name validation', () => {
    it('rejects names starting with a hyphen', () => {
      expect(() =>
        ResourcePathSchema.parse({
          namespace: 'sample',
          type: 'player',
          name: '-hero',
        })
      ).toThrow(ZodError);
    });

    it('rejects underscores in name', () => {
      expect(() =>
        ResourcePathSchema.parse({
          namespace: 'sample',
          type: 'player',
          name: 'hero_test',
        })
      ).toThrow(ZodError);
    });
  });
});

describe('formatResourceId', () => {
  it('builds namespace/type/name', () => {
    expect(
      formatResourceId({
        namespace: 'test',
        type: 'image',
        name: 'image.mr46a88v1.v0',
      })
    ).toBe('test/image/image.mr46a88v1.v0');
  });
});

describe('parseResourceId', () => {
  it('parses dotted ids into ResourcePathSchema', () => {
    expect(parseResourceId.parse('test/image/image.mr46a88v1.v0')).toEqual({
      namespace: 'test',
      type: 'image',
      name: 'image.mr46a88v1.v0',
    });
  });

  it('stays consistent with IdSchema', () => {
    const id = 'sample/image/hero.down1.v0';
    expect(IdSchema.parse(id)).toBe(id);
    expect(parseResourceId.parse(id)).toEqual({
      namespace: 'sample',
      type: 'image',
      name: 'hero.down1.v0',
    });
  });
});
