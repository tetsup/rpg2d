import z from 'zod';

export const NamespacePostParamsSchema = z.object({
  id: z.string(),
  displayName: z.string(),
  description: z.string(),
  private: z.boolean(),
});
