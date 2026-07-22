import { NamespaceFilterSchema } from '@schema/filter/domain';

describe('NamespaceFilterSchema', () => {
  it('accepts empty filter', () => {
    expect(NamespaceFilterSchema.parse([])).toEqual([]);
  });

  it('accepts free text search', () => {
    expect(
      NamespaceFilterSchema.parse([
        {
          name: 'q',
          value: 'fire',
        },
      ])
    ).toEqual([
      {
        name: 'q',
        value: 'fire',
      },
    ]);
  });

  it('accepts id equality filter', () => {
    expect(
      NamespaceFilterSchema.parse([
        {
          name: 'id',
          op: 'eq',
          value: 'namespace1',
        },
      ])
    ).toEqual([
      {
        name: 'id',
        op: 'eq',
        value: 'namespace1',
      },
    ]);
  });

  it('accepts description contains filter', () => {
    expect(
      NamespaceFilterSchema.parse([
        {
          name: 'description',
          op: 'contains',
          value: 'fire',
        },
      ])
    ).toEqual([
      {
        name: 'description',
        op: 'contains',
        value: 'fire',
      },
    ]);
  });

  it('accepts createdAt comparison filter', () => {
    const date = new Date();

    expect(
      NamespaceFilterSchema.parse([
        {
          name: 'createdAt',
          op: 'gt',
          value: date,
        },
      ])
    ).toEqual([
      {
        name: 'createdAt',
        op: 'gt',
        value: date,
      },
    ]);
  });

  it('accepts multiple filters', () => {
    expect(
      NamespaceFilterSchema.parse([
        {
          name: 'id',
          op: 'eq',
          value: 'namespace1',
        },
        {
          name: 'description',
          op: 'contains',
          value: 'fire',
        },
      ])
    ).toHaveLength(2);
  });

  it('rejects unknown field', () => {
    expect(() =>
      NamespaceFilterSchema.parse([
        {
          name: 'unknown',
          op: 'eq',
          value: 'test',
        },
      ])
    ).toThrow();
  });

  it('rejects invalid operator for id', () => {
    expect(() =>
      NamespaceFilterSchema.parse([
        {
          name: 'id',
          op: 'contains',
          value: 'test',
        },
      ])
    ).toThrow();
  });

  it('rejects invalid operator for description', () => {
    expect(() =>
      NamespaceFilterSchema.parse([
        {
          name: 'description',
          op: 'gt',
          value: 'test',
        },
      ])
    ).toThrow();
  });

  it('rejects invalid value type for createdAt', () => {
    expect(() =>
      NamespaceFilterSchema.parse([
        {
          name: 'createdAt',
          op: 'gt',
          value: 'not a date',
        },
      ])
    ).toThrow();
  });

  it('rejects free text longer than 50 characters', () => {
    expect(() =>
      NamespaceFilterSchema.parse([
        {
          name: 'q',
          value: 'a'.repeat(51),
        },
      ])
    ).toThrow();
  });

  it('rejects missing op for indexed field', () => {
    expect(() =>
      NamespaceFilterSchema.parse([
        {
          name: 'id',
          value: 'namespace1',
        },
      ])
    ).toThrow();
  });

  it('rejects missing value', () => {
    expect(() =>
      NamespaceFilterSchema.parse([
        {
          name: 'id',
          op: 'eq',
        },
      ])
    ).toThrow();
  });
});
