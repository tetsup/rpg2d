import { IdSchema } from '@schema/resource/common/base';

describe('IdSchema', () => {
  it('正常系', () => {
    expect(IdSchema.parse('test/variable/status.poison')).toBe('test/variable/status.poison');
  });

  it('異常系', () => {
    expect(() => IdSchema.parse('test/variable/.invalid')).toThrow();
    expect(() => IdSchema.parse('test/variable/invalid.')).toThrow();
    expect(() => IdSchema.parse('test/variable/a..b')).toThrow();
  });
});
