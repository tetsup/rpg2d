import { rgbaArrayToUint8 } from '@dev/utils/image/rgba';
import z from 'zod';

const sizeSchema = z.object({
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

const rgbaSchema = z
  .array(z.number().int().min(0).max(255))
  .length(4, { message: 'RGBA must have exactly 4 elements' });

const paletteSchema = z.record(
  z.string().regex(/^[0-9a-zA-Z]{2}$/, {
    message: 'palette key must be 2 alphanumeric characters',
  }),
  rgbaSchema
);

const rowSchema = z
  .string()
  .trim()
  .regex(/^([0-9a-zA-Z]{2})(\s+[0-9a-zA-Z]{2})*$/, {
    message: 'each row must be space-separated 2-character tokens (e.g. "aa bb cc")',
  });

export const yamlImageSchema = z
  .object({
    size: sizeSchema,
    palette: paletteSchema,
    pixels: z.array(rowSchema),
  })
  .superRefine((data, ctx) => {
    const { width, height } = data.size;

    if (data.pixels.length !== height) {
      ctx.addIssue({
        code: 'custom',
        message: `pixels row count mismatch: expected ${height}, got ${data.pixels.length}`,
        path: ['pixels'],
      });
    }

    data.pixels.forEach((row, y) => {
      const tokens = row.split(/\s+/);
      if (tokens.length !== width) {
        ctx.addIssue({
          code: 'custom',
          message: `row ${y}: expected ${width} pixels, got ${tokens.length}`,
          path: ['pixels', y],
        });
      }

      tokens.forEach((token, x) => {
        if (!(token in data.palette)) {
          ctx.addIssue({
            code: 'custom',
            message: `unknown token "${token}" at (${x}, ${y})`,
            path: ['pixels', y],
          });
        }
      });
    });
  })
  .transform((data) => ({
    size: data.size,
    rgba: rgbaArrayToUint8(data.pixels.flatMap((row) => row.split(' ').map((pixel) => data.palette[pixel]))),
  }));
