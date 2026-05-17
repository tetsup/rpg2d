import type z from 'zod';
import type { ImageSchema } from '@schema/resource/image';

export type ImageData = z.infer<typeof ImageSchema>;
