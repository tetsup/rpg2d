import z from 'zod';
import { IdSchema, ResourceSchemaBase } from './common/base';

export const SkinSchema = ResourceSchemaBase('skin', {
  textures: z.object({ left: IdSchema, right: IdSchema, up: IdSchema, down: IdSchema }),
});
