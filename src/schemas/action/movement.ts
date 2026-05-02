import z from 'zod';
import { PositionSchema } from '../common';

export const DirectionSchema = z.enum(['left', 'right', 'up', 'down']);

const WalkSchema = z.object({
  command: z.literal('walk'),
  direction: DirectionSchema,
  async: z.boolean(),
  durationMs: z.number().int().min(0).optional(),
  force: z.boolean().default(false),
});

const JumpSchema = z.object({
  command: z.literal('jump'),
  dest: PositionSchema,
  relative: z.boolean(),
  async: z.boolean(),
  durationMs: z.number().int().min(0).optional(),
  force: z.boolean().default(true),
});

export const MovementSchema = z.discriminatedUnion('command', [WalkSchema, JumpSchema]);

export type Movement = z.infer<typeof MovementSchema>;
