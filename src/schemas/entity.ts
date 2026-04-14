import z from 'zod';
import { IdSchema, ResourceSchemaBase } from './common';
import { ActionSchema } from './action';

const EntityActionTriggerSchema = z.enum(['check', 'touch']);

const ConditionSchema = z.object();

export const EntitySchema = ResourceSchemaBase('entity', {
  skin: IdSchema,
  condition: ConditionSchema,
  actions: z.record(EntityActionTriggerSchema, ActionSchema),
});

export type EntityData = z.infer<typeof EntitySchema>;
