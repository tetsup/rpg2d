import z from 'zod';
import { IdSchema, ResourceSchemaBase } from '@/schemas/common';

const TexturePlaybackSchema = z.object({ tickMs: z.number().positive(), repeat: z.boolean() });
export type TexturePlayback = z.infer<typeof TexturePlaybackSchema>;

export const TextureSchema = ResourceSchemaBase('texture', {
  images: z.array(IdSchema),
  playback: TexturePlaybackSchema.optional(),
});
export type TextureData = z.infer<typeof TextureSchema>;
