import z from 'zod';
import { IdSchema } from './common/base';

export const TileActionTriggerSchema = z.enum(['onEnter', 'onLeave', 'onStay', 'postEnter', 'postLeave']);

export const TileActionsSchema = z.partialRecord(TileActionTriggerSchema, IdSchema);

export const TileSchema = z.object({
  texture: IdSchema,
  allowOverwrap: z.boolean(),
  actions: TileActionsSchema,
});
