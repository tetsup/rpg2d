import { EntitySchema } from '@/schemas/entity';

describe('EntitySchema', () => {
  it('正常にパースできる', () => {
    const result = EntitySchema.parse({
      id: 'npc1',
      appearance: {
        default: { base: 'npc' },
      },
      position: { x: 0, y: 0 },
    });

    expect(result.position.x).toBe(0);
  });

  it('appearance rulesも使える', () => {
    const result = EntitySchema.parse({
      id: 'npc1',
      appearance: {
        default: { base: 'npc' },
        rules: [
          {
            when: {
              path: 'time',
              operator: '==',
              value: 1,
            },
            set: { base: 'night' },
          },
        ],
      },
      position: { x: 0, y: 0 },
    });

    expect(result.appearance.rules.length).toBe(1);
  });

  it('position不正は落ちる', () => {
    expect(() =>
      EntitySchema.parse({
        id: 'npc1',
        appearance: { default: {} },
        position: { x: '0', y: 0 },
      })
    ).toThrow();
  });
});
