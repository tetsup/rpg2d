import z from 'zod';
import { ResourceSchemaBase } from '@/schemas/common';
import { TextureSchema } from './texture';

export const SkinSchema = ResourceSchemaBase('skin', {
  textures: z.object({ left: TextureSchema, right: TextureSchema, up: TextureSchema, down: TextureSchema }),
});

export type SkinData = z.infer<typeof SkinSchema>;
