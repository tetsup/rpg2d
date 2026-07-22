import type z from 'zod';
import type { EntityInitialStateSchema, FieldSchema, TileCodeSchema } from '@schema/resource/field';

export type TileCode = z.infer<typeof TileCodeSchema>;
export type EntityInitialState = z.infer<typeof EntityInitialStateSchema>;
export type FieldData = z.infer<typeof FieldSchema>;
