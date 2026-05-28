import z from 'zod';
import { IdSchemaFromType } from './common/base';

const GlyphHexSchema = z.string().regex(/^[0-9A-Fa-f]{16}$/);

export const FontSchema = z.object({
  id: IdSchemaFromType('font'),
  format: z.literal('simple'),
  glyphWidth: z.literal(8),
  glyphHeight: z.literal(8),
  chars: z.record(z.string().length(1), GlyphHexSchema),
  compose: z.record(z.string().length(1), z.tuple([z.string().length(1), z.string().length(1)])).default({}),
});
