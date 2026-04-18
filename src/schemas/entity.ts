import z from 'zod';
import { AppearanceSchema } from './appearance';

export const EntitySchema = z.object({
  id: z.string(),
  appearance: AppearanceSchema,
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  context: z.record(z.string(), z.any()).optional(),
});

export type EntityData = z.infer<typeof EntitySchema>;
