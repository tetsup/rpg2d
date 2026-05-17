import type z from 'zod';
import type { TexturePlaybackSchema, AnimationLayerSchema, TextureSchema } from '@schema/resource/texture';

export type TexturePlayback = z.infer<typeof TexturePlaybackSchema>;

export type LayerAnimation = z.infer<typeof AnimationLayerSchema>;

export type TextureData = z.infer<typeof TextureSchema>;
