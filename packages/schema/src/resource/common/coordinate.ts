import z from 'zod';

export const SizeSchema = z.object({ width: z.number().int().min(1), height: z.number().int().min(1) });

export const PositionSchema = z.object({ x: z.number().int(), y: z.number().int() });

export const DirectionSchema = z.enum(['left', 'right', 'up', 'down']);
