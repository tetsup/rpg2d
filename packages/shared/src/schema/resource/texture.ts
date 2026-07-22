import z from 'zod';
import { IdSchema } from './common/base';

export const TexturePlaybackSchema = z.object({ tickMs: z.number().positive(), repeat: z.boolean() });

export const AnimationLayerSchema = z.object({
  priority: z.number().int().min(0).max(15),
  images: z.array(IdSchema),
  playback: TexturePlaybackSchema.optional(),
});

export const TextureSchema = z.object({
  layers: z.array(AnimationLayerSchema),
});
