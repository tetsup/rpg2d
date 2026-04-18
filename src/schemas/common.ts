import z from 'zod';

export const IdSchema = z.string().min(1);
export type Id = z.infer<typeof IdSchema>;

export const PositionSchema = z.object({ x: z.number().int(), y: z.number().int() });
export type Position = z.infer<typeof PositionSchema>;

export const ResourceSchema = <T extends string>(resourceType: T) =>
  z.object({
    id: IdSchema,
    type: z.literal(resourceType),
  });

export const ResourceSchemaBase = <T extends z.ZodRawShape>(resourceType: string, data: T) =>
  z.object({ ...ResourceSchema(resourceType).shape, ...data }).strict();
