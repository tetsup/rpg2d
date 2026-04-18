import {
  SingleConditionSchema,
  ConditionSchema,
  PathSchema,
  ValueDefinitionSchema,
  buildValueSchema,
} from '@/schemas/condition';

describe('ValueDefinitionSchema', () => {
  it('number定義が通る', () => {
    expect(
      ValueDefinitionSchema.parse({
        type: 'number',
        asInt: true,
      })
    ).toBeTruthy();
  });

  it('string定義が通る', () => {
    expect(
      ValueDefinitionSchema.parse({
        type: 'string',
      })
    ).toBeTruthy();
  });

  it('invalid typeは落ちる', () => {
    expect(() => ValueDefinitionSchema.parse({ type: 'bool' })).toThrow();
  });
});

describe('buildValueSchema', () => {
  it('number制約が効く', () => {
    const schema = buildValueSchema({
      type: 'number',
      min: 1,
      max: 10,
      asInt: true,
      optional: false,
    });

    expect(schema.parse(5)).toBe(5);
    expect(() => schema.parse(0)).toThrow();
    expect(() => schema.parse(11)).toThrow();
    expect(() => schema.parse(1.5)).toThrow();
  });

  it('optionalが効く', () => {
    const schema = buildValueSchema({
      type: 'number',
      asInt: true,
      optional: true,
    });

    expect(schema.parse(undefined)).toBeUndefined();
  });

  it('string制約が効く', () => {
    const schema = buildValueSchema({
      type: 'string',
      min: 2,
      max: 5,
      optional: false,
    });

    expect(schema.parse('abc')).toBe('abc');
    expect(() => schema.parse('a')).toThrow();
    expect(() => schema.parse('abcdef')).toThrow();
  });
});

describe('PathSchema', () => {
  it('正常系', () => {
    expect(PathSchema.parse('status.poison')).toBe('status.poison');
  });

  it('異常系', () => {
    expect(() => PathSchema.parse('.invalid')).toThrow();
    expect(() => PathSchema.parse('invalid.')).toThrow();
    expect(() => PathSchema.parse('a..b')).toThrow();
  });
});

describe('ConditionSchema', () => {
  it('正常系', () => {
    expect(
      SingleConditionSchema.parse({
        path: 'hp',
        operator: '>',
        value: 10,
      })
    ).toBeTruthy();
  });

  it('数値比較にstringはNG', () => {
    expect(() =>
      SingleConditionSchema.parse({
        path: 'hp',
        operator: '>',
        value: '10',
      })
    ).toThrow();
  });
});

describe('ConditionGroupSchema', () => {
  it('単体条件', () => {
    expect(
      ConditionSchema.parse({
        path: 'hp',
        operator: '==',
        value: 10,
      })
    ).toBeTruthy();
  });

  it('all', () => {
    expect(
      ConditionSchema.parse({
        all: [
          { path: 'hp', operator: '>', value: 5 },
          { path: 'mp', operator: '>', value: 1 },
        ],
      })
    ).toBeTruthy();
  });

  it('ネスト', () => {
    expect(
      ConditionSchema.parse({
        any: [
          {
            all: [{ path: 'hp', operator: '>', value: 5 }],
          },
        ],
      })
    ).toBeTruthy();
  });
});
