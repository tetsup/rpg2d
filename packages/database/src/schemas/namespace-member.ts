import { z } from 'zod';

export const NamespaceMemberDocumentSchema = z.object({
  namespaceId: z.string(),
  userId: z.string(),
  permissions: z.object({
    read: z.boolean(),
    create: z.boolean(),
    update: z.boolean(),
    delete: z.boolean(),
    admin: z.boolean(),
  }),
});
