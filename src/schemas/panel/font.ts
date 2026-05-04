import z from 'zod';
import { ResourceSchemaBase } from '../common';

const GlyphHexSchema = z.string().regex(/^[0-9A-Fa-f]{16}$/);

export const FontSchema = ResourceSchemaBase('font', {
  format: z.literal('simple'),
  glyphWidth: z.literal(8),
  glyphHeight: z.literal(8),
  chars: z.record(z.string().length(1), GlyphHexSchema),
  compose: z.record(z.string().length(1), z.tuple([z.string().length(1), z.string().length(1)])).default({}),
});

export type FontData = z.infer<typeof FontSchema>;

export type FontDeps = {};
