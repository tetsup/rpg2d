import type z from 'zod';
import type { SkinSchema } from '@schema/resource/skin';

export type SkinData = z.infer<typeof SkinSchema>;
