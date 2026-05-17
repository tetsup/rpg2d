import type z from 'zod';
import type { EntityActionTriggerSchema, EntitySchema } from '@schema/resource/entity';

export type EntityActionTrigger = z.infer<typeof EntityActionTriggerSchema>;
export type EntityData = z.infer<typeof EntitySchema>;
