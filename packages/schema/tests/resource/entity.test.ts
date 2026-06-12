import { EntitySchema } from '@schema/resource/entity';

describe('EntitySchema', () => {
  it('正常にパースできる', () => {
    const result = EntitySchema.parse({
      id: 'test/entity/npc1',
      visual: 'skin',
      skin: 'test/skin/dummyskin',
      allowOverwrap: true,
      actions: {},
    });

    expect(result.visual === 'skin' && result.skin).toBe('test/skin/dummyskin');
  });

  it('visual不整合は落ちる', () => {
    expect(() =>
      EntitySchema.parse({
        id: 'test/entity/npc1',
        visual: 'texture',
        skin: 'test/skin/dummyskin',
        allowOverwrap: true,
        actions: {},
      })
    ).toThrow();
  });
});
