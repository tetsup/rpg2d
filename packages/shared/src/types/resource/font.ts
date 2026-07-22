import type z from 'zod';
import type { FontSchema } from '@schema/resource/font';

export type FontData = z.infer<typeof FontSchema>;
