import z from 'zod';
import { IdSchema } from './common/base';

export const EntityActionTriggerSchema = z.enum([
  'onEnter',
  'onLeave',
  'onStay',
  'postEnter',
  'postLeave',
  'onCheck',
  'onTick',
]);

export const EntityActionsSchema = z.partialRecord(EntityActionTriggerSchema, IdSchema);

export const EntitySchema = z.discriminatedUnion('visual', [
  z.object({
    visual: z.literal('skin'),
    skin: IdSchema,
    allowOverwrap: z.boolean(),
    moveDurationMs: z.number().int().optional(),
    actions: EntityActionsSchema,
  }),
  z.object({
    visual: z.literal('texture'),
    texture: IdSchema,
    allowOverwrap: z.boolean(),
    moveDurationMs: z.number().int().optional(),
    actions: EntityActionsSchema,
  }),
  z.object({
    visual: z.literal('none'),
    allowOverwrap: z.boolean(),
    moveDurationMs: z.number().int().optional(),
    actions: EntityActionsSchema,
  }),
]);
