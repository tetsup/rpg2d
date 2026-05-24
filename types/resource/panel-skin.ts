import type z from 'zod';
import type { PanelSkinSchema } from '@schema/resource/panel-skin';

export type PanelSkinData = z.infer<typeof PanelSkinSchema>;
