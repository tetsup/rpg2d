import { z } from 'zod';

export const NamespacePermissionInputSchema = z.object({
  namespaceId: z.string(),
  userId: z.string(),
  permission: z.enum(['owner', 'maintainer', 'reader']),
});
