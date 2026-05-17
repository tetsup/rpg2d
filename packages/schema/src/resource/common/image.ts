import z from 'zod';

export const ByteNumberSchema = z.number().int().min(0).max(255);

export const ColorSchema = z.object({
  r: ByteNumberSchema,
  g: ByteNumberSchema,
  b: ByteNumberSchema,
  a: ByteNumberSchema.default(255),
});
