import z from 'zod';
import { IdSchema, ResourceSchemaBase } from '@/schemas/common';

const TexturePlaybackSchema = z.object({ tickMs: z.number().positive(), repeat: z.boolean() });
export type TexturePlayback = z.infer<typeof TexturePlaybackSchema>;

const LayerAnimationSchema = z.object({
  priority: z.number().int().min(0).max(15),
  images: z.array(IdSchema),
  playback: TexturePlaybackSchema.optional(),
});

export type LayerAnimation = z.infer<typeof LayerAnimationSchema>;

export const TextureSchema = ResourceSchemaBase('texture', {
  layers: z.array(LayerAnimationSchema),
});

export type TextureData = z.infer<typeof TextureSchema>;

export type TextureDeps = {};
