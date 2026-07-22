import type z from 'zod';
import type { PanelSchema } from '@schema/resource/panel';

export type PanelData = z.infer<typeof PanelSchema>;
