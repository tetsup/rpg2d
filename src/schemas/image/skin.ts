import z from 'zod';
import { IdSchema, ResourceSchemaBase } from '@/schemas/common';
import type { Texture } from '@/resource/domain/texture';

export const SkinSchema = ResourceSchemaBase('skin', {
  textures: z.object({ left: IdSchema, right: IdSchema, up: IdSchema, down: IdSchema }),
});

export type SkinData = z.infer<typeof SkinSchema>;

export type SkinDeps = { textures: { left: Texture; right: Texture; up: Texture; down: Texture } };
