import z from 'zod';
import { createFilterSchema } from '@schema/common/search';

describe('createFilterSchema', () => {
  const schema = createFilterSchema(
    z.object({
      name: z.string(),
      level: z.number(),
      enabled: z.boolean(),
      role: z.enum(['admin', 'user']),
      nested: z.object({
        power: z.number(),
        title: z.string(),
      }),
    })
  );

  it('parses empty filter', () => {
    expect(schema.parse({})).toEqual({});
  });

  it('converts root text search', () => {
    expect(
      schema.parse({
        q: 'fire',
      })
    ).toEqual({
      $text: {
        $search: 'fire',
      },
    });
  });

  it('converts string eq', () => {
    expect(
      schema.parse({
        name: {
          eq: 'fire',
        },
      })
    ).toEqual({
      name: 'fire',
    });
  });

  it('converts string ne', () => {
    expect(
      schema.parse({
        name: {
          ne: 'fire',
        },
      })
    ).toEqual({
      name: {
        $ne: 'fire',
      },
    });
  });

  it('converts number eq', () => {
    expect(
      schema.parse({
        level: {
          eq: 10,
        },
      })
    ).toEqual({
      level: 10,
    });
  });

  it('converts number comparison operators', () => {
    expect(
      schema.parse({
        level: {
          ne: 1,
          gt: 10,
          gte: 11,
          lt: 100,
          lte: 99,
        },
      })
    ).toEqual({
      level: {
        $ne: 1,
        $gt: 10,
        $gte: 11,
        $lt: 100,
        $lte: 99,
      },
    });
  });

  it('passes boolean through', () => {
    expect(
      schema.parse({
        enabled: true,
      })
    ).toEqual({
      enabled: true,
    });
  });

  it('converts enum eq', () => {
    expect(
      schema.parse({
        role: {
          eq: 'admin',
        },
      })
    ).toEqual({
      role: 'admin',
    });
  });

  it('converts enum ne', () => {
    expect(
      schema.parse({
        role: {
          ne: 'admin',
        },
      })
    ).toEqual({
      role: {
        $ne: 'admin',
      },
    });
  });

  it('flattens nested object', () => {
    expect(
      schema.parse({
        nested: {
          power: {
            gte: 10,
          },
        },
      })
    ).toEqual({
      'nested.power': {
        $gte: 10,
      },
    });
  });

  it('flattens nested string', () => {
    expect(
      schema.parse({
        nested: {
          title: {
            eq: 'fire',
          },
        },
      })
    ).toEqual({
      'nested.title': 'fire',
    });
  });

  it('supports multiple filters', () => {
    expect(
      schema.parse({
        q: 'fire',
        name: {
          eq: 'Fireball',
        },
        level: {
          gte: 10,
        },
        nested: {
          power: {
            lt: 100,
          },
        },
      })
    ).toEqual({
      $text: {
        $search: 'fire',
      },
      name: 'Fireball',
      level: {
        $gte: 10,
      },
      'nested.power': {
        $lt: 100,
      },
    });
  });

  it('rejects invalid enum value', () => {
    expect(() =>
      schema.parse({
        role: {
          eq: 'super-admin',
        },
      })
    ).toThrow();
  });

  it('rejects string in number filter', () => {
    expect(() =>
      schema.parse({
        level: {
          gt: '10',
        },
      })
    ).toThrow();
  });

  it('rejects unknown field', () => {
    expect(() =>
      schema.parse({
        unknown: {
          eq: 'test',
        },
      })
    ).toThrow();
  });

  it('rejects empty text search', () => {
    expect(() =>
      schema.parse({
        $text: '',
      })
    ).toThrow();
  });

  it('rejects invalid nested field', () => {
    expect(() =>
      schema.parse({
        nested: {
          unknown: {
            eq: 'test',
          },
        },
      })
    ).toThrow();
  });
});
