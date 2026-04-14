import { Tile } from '@/resource/tile';
import { ResourceManager } from '@/resource/resource-manager';
import { zocker } from 'zocker';
import { TileSchema } from '@/schemas/tile';
import { TextureSchema } from '@/schemas/image/texture';
import { Texture } from '@/resource/texture';

describe('Tile.factory', () => {
  it('依存を解決してインスタンス生成される', async () => {
    const getMock = vi.fn().mockResolvedValue({ name: 'dummy' });
    const resources = {
      get: getMock,
    } as unknown as ResourceManager;
    const raw = zocker(TileSchema).generate();
    const tile = await Tile.factory(resources, raw);

    expect(tile).toBeInstanceOf(Tile);
    expect(getMock).toHaveBeenCalledWith(raw.texture, TextureSchema, Texture.factory);
  });

  it('loadDepsの結果がconstructorに渡る', async () => {
    const texture = { name: 'texture-data' };
    const resources = {
      get: vi.fn().mockResolvedValue(texture),
    } as unknown as ResourceManager;
    const raw = zocker(TileSchema).generate();
    const tile = await Tile.factory(resources, raw);

    expect(tile.deps.texture).toBe(texture);
  });
});
