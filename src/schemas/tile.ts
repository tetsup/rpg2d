import z from 'zod';
import { IdSchema, ResourceSchemaBase } from './common';
import { ActionSchema } from './action';

const TileActionTriggerSchema = z.enum(['onEnter', 'onLeave', 'onStay', 'postEnter', 'postLeave']);
export type TileActionTrigger = z.infer<typeof TileActionTriggerSchema>;

const TileActionsSchema = z.record(TileActionTriggerSchema, ActionSchema);

export const TileSchema = ResourceSchemaBase('tile', { texture: IdSchema, actions: TileActionsSchema });

export type TileData = z.infer<typeof TileSchema>;
