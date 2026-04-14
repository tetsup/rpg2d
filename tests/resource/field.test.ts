import z from 'zod';
import { zocker } from 'zocker';
import { Field } from '@/resource/field';
import { ResourceManager } from '@/resource/resource-manager';
import { EntityMappingSchema, FieldSchema } from '@/schemas/field';
import { Entity } from '@/resource/entity';
import { EntitySchema } from '@/schemas/entity';
import { TileSchema } from '@/schemas/tile';
import { Tile } from '@/resource/tile';

function createFieldSchema<const TKeys extends readonly [string, ...string[]]>(keys: TKeys) {
  const TileKeyEnum = z.enum(keys);

  const tilesShape = Object.fromEntries(keys.map((k) => [k, z.string()])) as Record<TKeys[number], z.ZodString>;

  return z.object({
    id: z.string(),
    type: z.literal('field'),
    name: z.string(),
    entities: z.array(EntityMappingSchema),
    tiles: z.object(tilesShape),
    map: z.array(z.array(TileKeyEnum)),
  });
}

describe('Field.factory', () => {
  it('依存を解決してインスタンス生成される', async () => {
    const getMock = vi.fn().mockResolvedValue({ name: 'dummy-data' });
    const resources = {
      get: getMock,
    } as unknown as ResourceManager;
    const raw = zocker(
      createFieldSchema(['WT', 'MT', 'GR']).extend({ entities: z.array(EntityMappingSchema).min(1) })
    ).generate();
    const field = await Field.factory(resources, raw);

    expect(field).toBeInstanceOf(Field);
    expect(getMock).toHaveBeenCalledWith(raw.entities[0].entityId, EntitySchema, expect.any(Function));
    expect(getMock).toHaveBeenCalledWith(Object.values(raw.tiles)[0], TileSchema, expect.any(Function));
    expect(getMock).toHaveBeenCalledTimes(3 + raw.entities.length);
  });

  it('loadDepsの結果がconstructorに渡る', async () => {
    const dummy = { name: 'dummy-data' };
    const resources = {
      get: vi.fn().mockResolvedValue(dummy),
    } as unknown as ResourceManager;
    const raw = zocker(
      createFieldSchema(['WT', 'MT', 'GR']).extend({ entities: z.array(EntityMappingSchema).min(1) })
    ).generate();
    const field = await Field.factory(resources, raw);

    expect(field.deps.tiles['WT']).eq(dummy);
    expect(field.deps.tiles['MT']).eq(dummy);
    expect(field.deps.tiles['GR']).eq(dummy);
    expect(field.deps.entities[raw.entities[0].instanceId]).eq(dummy);
  });
});
