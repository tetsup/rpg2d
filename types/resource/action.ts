import type z from 'zod';
import type { ActionSchema } from '@schema/resource/action';
import type { MovementSchema } from '@schema/resource/action/movement';

export type Movement = z.infer<typeof MovementSchema>;

export type ActionData = z.infer<typeof ActionSchema>;
