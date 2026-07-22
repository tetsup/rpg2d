import { deepNullable } from '@schema/utils/deep-nullable';
import { EntitySchema } from '@schema/resource/entity';
import { FieldSchema } from '@schema/resource/field';
import { ImageSchema } from '@schema/resource/image';
import { SkinSchema } from '@schema/resource/skin';
import { TextureSchema } from '@schema/resource/texture';
import { TileSchema } from '@schema/resource/tile';

const validTextureId = 'sample/texture/hero.down.v0';
const validImageId = 'sample/image/hero.down1.v0';
const validSkinId = 'sample/skin/hero.v0';

describe('deepNullable', () => {
  describe('skin', () => {
    const schema = deepNullable(SkinSchema);

    it('requires all texture keys while allowing null values', () => {
      const result = schema.safeParse({
        textures: {
          down: validTextureId,
          up: null,
          left: null,
          right: null,
        },
      });

      expect(result.success).toBe(true);
    });

    it('rejects omitted required keys', () => {
      const result = schema.safeParse({
        textures: {
          down: validTextureId,
          left: null,
          right: null,
        },
      });

      expect(result.success).toBe(false);
    });

    it('rejects invalid id strings', () => {
      const result = schema.safeParse({
        textures: {
          down: 'invalid',
          up: null,
          left: null,
          right: null,
        },
      });

      expect(result.success).toBe(false);
    });
  });

  describe('texture', () => {
    const schema = deepNullable(TextureSchema);

    it('allows empty layers', () => {
      const result = schema.safeParse({ layers: [] });
      expect(result.success).toBe(true);
    });

    it('allows null image references inside layers', () => {
      const result = schema.safeParse({
        layers: [
          {
            priority: 0,
            images: [validImageId, null],
          },
        ],
      });

      expect(result.success).toBe(true);
    });

    it('allows a layer with an empty images array', () => {
      const result = schema.safeParse({
        layers: [{ priority: 0, images: [] }],
      });

      expect(result.success).toBe(true);
    });
  });

  describe('tile', () => {
    const schema = deepNullable(TileSchema);

    it('allows null texture while keeping allowOverwrap', () => {
      const result = schema.safeParse({
        texture: null,
        allowOverwrap: false,
      });

      expect(result.success).toBe(true);
    });

    it('allows omitted optional actions', () => {
      const result = schema.safeParse({
        texture: null,
        allowOverwrap: true,
      });

      expect(result.success).toBe(true);
    });
  });

  describe('entity', () => {
    const schema = deepNullable(EntitySchema);

    it('allows skin branch with null skin id', () => {
      const result = schema.safeParse({
        visual: 'skin',
        skin: null,
        allowOverwrap: false,
        actions: {},
      });

      expect(result.success).toBe(true);
    });

    it('rejects mismatched discriminator branch values', () => {
      const result = schema.safeParse({
        visual: 'texture',
        skin: validSkinId,
        allowOverwrap: false,
        actions: {},
      });

      expect(result.success).toBe(false);
    });
  });

  describe('image', () => {
    const schema = deepNullable(ImageSchema);

    it('strips superRefine and allows incomplete pixel data', () => {
      const result = schema.safeParse({
        size: { width: 16, height: 16 },
        palette: { aa: [0, 0, 0, 0] },
        pixels: [],
      });

      expect(result.success).toBe(true);
    });

    it('keeps nested object keys while allowing null leaf values', () => {
      const result = schema.safeParse({
        size: { width: null, height: null },
        palette: {},
        pixels: [],
      });

      expect(result.success).toBe(true);
    });

    it('rejects null in place of required object fields', () => {
      const result = schema.safeParse({
        size: null,
        palette: null,
        pixels: null,
      });

      expect(result.success).toBe(false);
    });
  });

  describe('field', () => {
    const schema = deepNullable(FieldSchema);

    it('strips map/tiles superRefine', () => {
      const result = schema.safeParse({
        name: 'draft',
        tiles: {},
        map: [['missing-code']],
      });

      expect(result.success).toBe(true);
    });
  });
});
