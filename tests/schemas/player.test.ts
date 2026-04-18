import { buildPlayerSchema, NameSchema } from '@/schemas/player';
import { StateDefinition } from '@/schemas/playerState';

describe('NameSchema', () => {
  it('fixed', () => {
    expect(NameSchema.parse({ type: 'fixed', value: 'Hero' })).toBeTruthy();
  });

  it('input', () => {
    expect(
      NameSchema.parse({
        type: 'input',
        input: {},
      })
    ).toBeTruthy();
  });

  it('reference', () => {
    expect(
      NameSchema.parse({
        type: 'reference',
        ref: '@name',
      })
    ).toBeTruthy();
  });
});

describe('PlayerSchema', () => {
  const def: StateDefinition = {
    hp: { type: 'number', asInt: true },
    status: {
      poison: { type: 'number', asInt: true },
    },
  };

  const schema = buildPlayerSchema(def);

  it('正常にパースできる', () => {
    const result: any = schema.parse({
      id: 'hero',
      name: { type: 'fixed', value: 'Hero' },
      appearance: { default: { base: 'hero' } },
      state: {
        hp: 10,
        status: { poison: 0 },
      },
    });

    expect(result.state.hp).toBe(10);
  });

  it('appearanceが適用される', () => {
    const result = schema.parse({
      id: 'hero',
      name: { type: 'fixed', value: 'Hero' },
      appearance: {
        default: { base: 'hero' },
        rules: [],
      },
      state: {
        hp: 10,
        status: { poison: 1 },
      },
    });

    expect(result.appearance.default.base).toBe('hero');
  });

  it('state不正は落ちる', () => {
    expect(() =>
      schema.parse({
        id: 'hero',
        name: { type: 'fixed', value: 'Hero' },
        appearance: { default: {} },
        state: {
          hp: '10',
        },
      })
    ).toThrow();
  });
});
