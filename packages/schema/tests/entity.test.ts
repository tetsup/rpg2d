import { EntitySchema } from '@schema/resource/entity';

describe('EntitySchema', () => {
  it('正常にパースできる', () => {
    const result = EntitySchema.parse({
      id: 'test/entity/npc1',
      type: 'entity',
      visual: 'skin',
      skin: 'test/skin/dummyskin',
      allowOverwrap: true,
      actions: {},
    });

    expect(result.visual === 'skin' && result.skin).toBe('test/skin/dummyskin');
  });

  it('type不正は落ちる', () => {
    expect(() =>
      EntitySchema.parse({
        id: 'test/entity/npc1',
        type: 'notaentity',
        visual: 'skin',
        skin: 'test/skin/dummyskin',
        allowOverwrap: true,
        actions: {},
      })
    ).toThrow();
  });
});
