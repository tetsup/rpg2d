import z from 'zod';
import type { Action } from '@/resource/domain/action';
import type { Texture } from '@/resource/domain/texture';
import { IdSchema, ResourceSchemaBase } from './common';
import { ActionSchema } from './action';

const TileActionTriggerSchema = z.enum(['onEnter', 'onLeave', 'onStay', 'postEnter', 'postLeave']);
export type TileActionTrigger = z.infer<typeof TileActionTriggerSchema>;

const TileActionsSchema = z.record(TileActionTriggerSchema, ActionSchema);

export const TileSchema = ResourceSchemaBase('tile', {
  texture: IdSchema,
  allowOverwrap: z.boolean(),
  actions: TileActionsSchema,
});

export type TileData = z.infer<typeof TileSchema>;

export type TileDeps = { texture: Texture; actions: Record<string, Action> };
