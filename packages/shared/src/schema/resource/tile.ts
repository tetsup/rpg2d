import z from 'zod';
import { IdSchema } from './common/base';
import { ActionSchema } from './action';

export const TileActionTriggerSchema = z.enum(['onEnter', 'onLeave', 'onStay', 'postEnter', 'postLeave']);

export const TileActionsSchema = z.record(TileActionTriggerSchema, ActionSchema);

export const TileSchema = z.object({
  texture: IdSchema,
  allowOverwrap: z.boolean(),
  actions: TileActionsSchema.optional(),
});
