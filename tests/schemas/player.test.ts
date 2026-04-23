import { buildPlayerSchema, NameSchema } from '@/schemas/player';
import type { StateDefinition } from '@/schemas/playerState';

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
      type: 'player',
      name: { type: 'fixed', value: 'Hero' },
      initialState: {
        hp: 10,
        status: { poison: 0 },
      },
      initialSkin: 'dummyskin',
    });

    expect(result.initialState.hp).toBe(10);
  });

  it('state不正は落ちる', () => {
    expect(() =>
      schema.parse({
        id: 'hero',
        type: 'player',
        name: { type: 'fixed', value: 'Hero' },
        initialState: {
          status: { poison: 0 },
        },
        initialSkin: 'dummyskin',
      })
    ).toThrow();
  });
});
