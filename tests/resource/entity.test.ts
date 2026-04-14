import { Entity } from '@/resource/entity';
import { ResourceManager } from '@/resource/resource-manager';
import { Skin } from '@/resource/skin';
import { EntitySchema } from '@/schemas/entity';
import { SkinSchema } from '@/schemas/image/skin';
import { zocker } from 'zocker';

describe('Entity.factory', () => {
  it('依存を解決してインスタンス生成される', async () => {
    const getMock = vi.fn().mockResolvedValue({ name: 'skin-data' });
    const resources = {
      get: getMock,
    } as unknown as ResourceManager;
    const raw = zocker(EntitySchema).generate();
    const entity = await Entity.factory(resources, raw);

    expect(entity).toBeInstanceOf(Entity);
    expect(getMock).toHaveBeenCalledWith(raw.skin, SkinSchema, Skin.factory);
  });

  it('loadDepsの結果がconstructorに渡る', async () => {
    const skin = { name: 'skin-data' };
    const resources = {
      get: vi.fn().mockResolvedValue(skin),
    } as unknown as ResourceManager;
    const raw = zocker(EntitySchema).generate();
    const entity = await Entity.factory<'entity'>(resources, raw);

    expect((entity as any).deps.skin).toBe(skin);
  });
});
