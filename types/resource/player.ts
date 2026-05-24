import type z from 'zod';
import type { buildPlayerSchema } from '@schema/resource/player';
import type { StateDefinition } from '../variable';

export type PlayerData<T extends StateDefinition = any> = z.infer<ReturnType<typeof buildPlayerSchema<T>>>;
