import { EntitySchema } from '@/schemas/entity';

describe('EntitySchema', () => {
  it('正常にパースできる', () => {
    const result = EntitySchema.parse({
      id: 'npc1',
      type: 'entity',
      skin: 'dummyskin',
      allowOverwrap: true,
      actions: [],
    });

    expect(result.skin).toBe('dummyskin');
  });

  it('type不正は落ちる', () => {
    expect(() =>
      EntitySchema.parse({
        id: 'npc1',
        type: 'notaentity',
        skin: 'dummyskin',
        allowOverwrap: true,
        actions: [],
      })
    ).toThrow();
  });
});
