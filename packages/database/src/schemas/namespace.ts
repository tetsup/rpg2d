import { z } from 'zod';

export const NamespaceDocumentSchema = z.object({
  id: z.string(),
  displayName: z.string(),
  createdBy: z.string(),
});
