import {
  createDraftResourceInputSchema,
  createReadyResourceInputSchema,
  createResourceInputSchema,
} from '@schema/database/resource';

const validTextureId = 'sample/texture/hero.down.v0';

describe('createResourceInputSchema', () => {
  describe('skin', () => {
    const schema = createResourceInputSchema('skin');

    it('accepts draft input with null texture references', () => {
      const result = schema.safeParse({
        namespace: 'sample',
        type: 'skin',
        name: 'hero.v0',
        version: 0,
        isDraft: true,
        data: {
          textures: {
            down: validTextureId,
            up: null,
            left: null,
            right: null,
          },
        },
      });

      expect(result.success).toBe(true);
    });

    it('rejects ready input with null texture references', () => {
      const result = schema.safeParse({
        namespace: 'sample',
        type: 'skin',
        name: 'hero.v0',
        version: 0,
        isDraft: false,
        data: {
          textures: {
            down: validTextureId,
            up: null,
            left: null,
            right: null,
          },
        },
      });

      expect(result.success).toBe(false);
    });

    it('rejects mismatched isDraft flag and data strictness', () => {
      const result = schema.safeParse({
        namespace: 'sample',
        type: 'skin',
        name: 'hero.v0',
        version: 0,
        isDraft: false,
        data: {
          textures: {
            down: validTextureId,
            up: null,
            left: null,
            right: null,
          },
        },
      });

      expect(result.success).toBe(false);
    });
  });

  describe('image', () => {
    const draftSchema = createDraftResourceInputSchema('image');
    const readySchema = createReadyResourceInputSchema('image');

    it('requires complete image data even in draft', () => {
      const result = draftSchema.safeParse({
        namespace: 'sample',
        type: 'image',
        name: 'hero.down1.v0',
        version: 0,
        isDraft: true,
        data: {
          size: { width: 16, height: 16 },
          palette: { ff: [0, 0, 0, 0] },
          pixels: [],
        },
      });

      expect(result.success).toBe(false);
    });

    it('accepts ready image data with complete pixels', () => {
      const row = Array(16).fill('ff').join(' ');
      const result = readySchema.safeParse({
        namespace: 'sample',
        type: 'image',
        name: 'hero.down1.v0',
        version: 0,
        isDraft: false,
        data: {
          size: { width: 16, height: 16 },
          palette: { ff: [0, 0, 0, 0] },
          pixels: Array(16).fill(row),
        },
      });

      expect(result.success).toBe(true);
    });
  });
});
