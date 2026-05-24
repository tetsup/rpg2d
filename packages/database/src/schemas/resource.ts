import { z } from 'zod';

export const ResourceDocumentSchema = z.object({
  id: z.string(),
  namespace: z.string(),
  type: z.string(),
  name: z.string(),
  refs: z.array(z.string()),
  data: z.unknown(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ResourceDocument = z.infer<typeof ResourceDocumentSchema>;
