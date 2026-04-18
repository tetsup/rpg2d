import { ResourceManager } from '@/resource/resource-manager';
import { Entity } from '@/resource/entity';
import { Skin } from '@/resource/skin';
import { EntityData } from '@/schemas/entity';
import { SkinSchema } from '@/schemas/image/skin';

describe('Entity.factory', () => {
  it('依存を解決してインスタンス生成される', async () => {
    const getMock = vi.fn().mockResolvedValue({ name: 'skin-data' });
    const resources = {
      get: getMock,
    } as unknown as ResourceManager;
    const raw: EntityData = {
      id: 'entity1',
      appearance: { default: { layer1: 'skin1' }, rules: [] },
      position: { x: 0, y: 0 },
    };
    const entity = await Entity.factory(resources, raw);

    expect(entity).toBeInstanceOf(Entity);
    expect(getMock).toHaveBeenCalledWith(raw.appearance.default.layer1, SkinSchema, Skin.factory);
  });

  it('loadDepsの結果がconstructorに渡る', async () => {
    const skin = { name: 'skin-data' };
    const resources = {
      get: vi.fn().mockResolvedValue(skin),
    } as unknown as ResourceManager;
    const raw: EntityData = {
      id: 'entity1',
      appearance: { default: { layer1: 'skin1' }, rules: [] },
      position: { x: 0, y: 0 },
    };
    const entity = await Entity.factory(resources, raw);

    expect(entity.deps.appearance.deps.layers.default.layer1).toBe(skin);
  });
});
