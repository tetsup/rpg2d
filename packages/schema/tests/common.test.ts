import { IdSchema } from '@schema/resource/common/base';

describe('IdSchema', () => {
  it('正常系', () => {
    expect(IdSchema.parse('test/skin/player.hero')).toBe('test/skin/player.hero');
  });

  it('異常系', () => {
    expect(() => IdSchema.parse('test/skin/.invalid')).toThrow();
    expect(() => IdSchema.parse('test/skin/invalid.')).toThrow();
    expect(() => IdSchema.parse('test/skin/a..b')).toThrow();
  });
});
