import z from 'zod';
import { IdSchema, IdSchemaFromType } from './common/base';

export const SkinSchema = z.object({
  id: IdSchemaFromType('skin'),
  textures: z.object({ left: IdSchema, right: IdSchema, up: IdSchema, down: IdSchema }),
});
