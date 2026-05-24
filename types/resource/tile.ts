import type z from 'zod';
import type { TileActionTriggerSchema, TileSchema } from '@schema/resource/tile';

export type TileActionTrigger = z.infer<typeof TileActionTriggerSchema>;

export type TileData = z.infer<typeof TileSchema>;
