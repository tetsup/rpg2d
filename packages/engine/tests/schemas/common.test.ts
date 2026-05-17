import { IdSchema } from '@/schemas/common';

describe('IdSchema', () => {
  it('正常系', () => {
    expect(IdSchema.parse('status.poison')).toBe('status.poison');
  });

  it('異常系', () => {
    expect(() => IdSchema.parse('.invalid')).toThrow();
    expect(() => IdSchema.parse('invalid.')).toThrow();
    expect(() => IdSchema.parse('a..b')).toThrow();
  });
});
