import { z } from 'zod';

export const NamespacePermissionDocumentSchema = z.object({
  namespaceId: z.string(),
  userId: z.string(),
  permission: z.enum(['owner', 'maintainer', 'reader']),
});
