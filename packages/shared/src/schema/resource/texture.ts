import z from 'zod';
import { IdSchema } from './common/base';
import { PositionSchema } from './common/coordinate';

export const LayerSchema = z.object({
  image: IdSchema,
  pos: PositionSchema,
  priority: z.number().int().min(0).max(15),
});

export const AnimationFrameSchema = z.object({
  layers: z.array(LayerSchema),
  duration: z.int().positive(),
});

export const TextureSchema = z.object({
  frames: z.array(AnimationFrameSchema),
  postAction: z.enum(['off', 'pause', 'repeat']),
});
