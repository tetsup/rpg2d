import type z from 'zod';
import type { AnimationFrameSchema, TextureSchema } from '@schema/resource/texture';

export type AnimationFrame = z.infer<typeof AnimationFrameSchema>;

export type TextureData = z.infer<typeof TextureSchema>;
