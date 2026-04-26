import z from 'zod';
import type { Skin } from '@/resource/domain/skin';
import type { Texture } from '@/resource/domain/texture';
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

export const EntitySchema = z.discriminatedUnion('visual', [
  ResourceSchemaBase('entity', {
    visual: z.literal('skin'),
    skin: IdSchema,
    allowOverwrap: z.boolean(),
    moveDurationMs: z.number().int().optional(),
    actions: EntityActionsSchema,
  }),
  ResourceSchemaBase('entity', {
    visual: z.literal('texture'),
    texture: IdSchema,
    allowOverwrap: z.boolean(),
    moveDurationMs: z.number().int().optional(),
    actions: EntityActionsSchema,
  }),
  ResourceSchemaBase('entity', {
    visual: z.literal('none'),
    allowOverwrap: z.boolean(),
    moveDurationMs: z.number().int().optional(),
    actions: EntityActionsSchema,
  }),
]);

export type EntityData = z.infer<typeof EntitySchema>;

export type EntityDeps = (
  | {
      visual: 'skin';
      skin: Skin;
    }
  | {
      visual: 'texture';
      texture: Texture;
    }
  | { visual: 'none' }
) & {
  actions: { trigger: string; action: Action }[];
};
