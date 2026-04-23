import z from 'zod';
import type { Skin } from '@/resource/domain/skin';
import type { Action } from '@/resource/domain/action';
import { IdSchema, ResourceSchemaBase } from './common';

const EntityActionTriggerSchema = z.enum([
  'onEnter',
  'onLeave',
  'onStay',
  'postEnter',
  'postLeave',
  'onCheck',
  'onTick',
]);
export type EntityActionTrigger = z.infer<typeof EntityActionTriggerSchema>;

const EntityActionsSchema = z.array(z.object({ trigger: EntityActionTriggerSchema, action: IdSchema }));

export const EntitySchema = ResourceSchemaBase('entity', {
  skin: IdSchema,
  allowOverwrap: z.boolean(),
  actions: EntityActionsSchema,
});

export type EntityData = z.infer<typeof EntitySchema>;

export type EntityDeps = {
  skin: Skin;
  actions: { trigger: string; action: Action }[];
};
