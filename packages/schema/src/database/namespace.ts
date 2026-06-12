import { z } from 'zod';

export const NamespaceDocumentSchema = z.object({
  id: z.string(),
  displayName: z.string(),
  description: z.string(),
  isPrivate: z.boolean(),
  createdBy: z.string(),
});
