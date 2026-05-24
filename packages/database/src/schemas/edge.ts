import { z } from 'zod';

export const ResourceEdgeDocumentSchema = z.object({
  from: z.string(),
  to: z.string(),
  type: z.string(),
});

export type ResourceEdgeDocument = z.infer<typeof ResourceEdgeDocumentSchema>;
