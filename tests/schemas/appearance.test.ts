import { AppearanceSchema, LayersSchema } from '@/schemas/appearance';

describe('AppearanceSchema', () => {
  it('defaultのみでOK', () => {
    const result = AppearanceSchema.parse({
      default: { base: 'hero' },
    });

    expect(result.rules).toEqual([]);
  });

  it('rules付き', () => {
    const result = AppearanceSchema.parse({
      default: {},
      rules: [
        {
          when: {
            path: 'hp',
            operator: '>',
            value: 0,
          },
          set: { base: 'alive' },
        },
      ],
    });

    expect(result.rules.length).toBe(1);
  });
});

describe('LayersSchema', () => {
  it('string', () => {
    expect(LayersSchema.parse({ base: 'hero' })).toBeTruthy();
  });

  it('null', () => {
    expect(LayersSchema.parse({ base: null })).toBeTruthy();
  });
});
