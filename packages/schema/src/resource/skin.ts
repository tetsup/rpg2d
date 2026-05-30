import z from 'zod';
import { IdSchema } from './common/base';

export const SkinSchema = z.object({
  textures: z.object({ left: IdSchema, right: IdSchema, up: IdSchema, down: IdSchema }),
});
