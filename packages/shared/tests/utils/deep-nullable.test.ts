import { deepNullable } from '@schema/utils/deep-nullable';
import { EntitySchema } from '@schema/resource/entity';
import { FieldSchema } from '@schema/resource/field';
import { ImageSchema } from '@schema/resource/image';
import { SkinSchema } from '@schema/resource/skin';
import { TextureSchema } from '@schema/resource/texture';
import { p } from 'node_modules/vitest/dist/chunks/reporters.d.B0uk8id2';

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

    it('allows empty frames', () => {
      const result = schema.safeParse({ frames: [], postAction: 'off' });
      expect(result.success).toBe(true);
    });

    it('allows empty layers and null duration inside frames', () => {
      const result = schema.safeParse({
        frames: [
          {
            layers: [],
            duration: null,
          },
        ],
        postAction: 'off',
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
