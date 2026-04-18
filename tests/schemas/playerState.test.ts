import { StateDefinitionSchema, buildStateSchema } from '@/schemas/playerState';

describe('StateDefinitionSchema', () => {
  it('ネスト構造が通る', () => {
    const def = {
      status: {
        poison: { type: 'number', asInt: true },
      },
    };

    expect(StateDefinitionSchema.parse(def)).toBeTruthy();
  });

  it('不正構造は落ちる', () => {
    expect(() =>
      StateDefinitionSchema.parse({
        status: { poison: { invalid: true } },
      })
    ).toThrow();
  });
});

describe('buildStateSchema', () => {
  it('ネストstateが動作する', () => {
    const def: any = {
      status: {
        poison: { type: 'number', asInt: true },
      },
    };

    const schema = buildStateSchema(def);

    expect(schema.parse({ status: { poison: 1 } })).toEqual({ status: { poison: 1 } });

    expect(() => schema.parse({ status: { poison: 'a' } })).toThrow();
  });

  it('strictで余計なキーが落ちる', () => {
    const def: any = {
      hp: { type: 'number', asInt: true },
    };

    const schema = buildStateSchema(def);

    expect(() => schema.parse({ hp: 10, extra: 1 })).toThrow();
  });
});
