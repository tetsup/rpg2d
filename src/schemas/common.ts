import z from 'zod';

export const IdSchema = z
  .string()
  .regex(
    /^[a-zA-Z][a-zA-Z0-9_]*(\.[a-zA-Z][a-zA-Z0-9_]*)*$/,
    "pathは 'a.b.c' 形式で、英数字、アンダースコアと単一ドットのみ使用できます"
  );
export type ResourceId = z.infer<typeof IdSchema>;

export const PrimitiveValueSchema = z.union([z.string(), z.number()]);

export type PrimitiveValue = z.infer<typeof PrimitiveValueSchema>;

export const PositionSchema = z.object({ x: z.number().int(), y: z.number().int() });
export type Position = z.infer<typeof PositionSchema>;

export const DirectionSchema = z.enum(['left', 'right', 'up', 'down']);

export const ResourceSchema = <T extends string>(resourceType: T) =>
  z.object({
    id: IdSchema,
    type: z.literal(resourceType),
  });

export const ResourceSchemaBase = <T extends z.ZodRawShape>(resourceType: string, data: T) =>
  z.object({ ...ResourceSchema(resourceType).shape, ...data }).strict();
