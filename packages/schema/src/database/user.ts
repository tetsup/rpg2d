import z from 'zod';
import { createFilterSchema } from '@schema/common/search';

export const UserDocumentSchema = z.object({
  id: z.string().nonempty(),
  presenceName: z.string().nonempty(),
  email: z.email().optional(),
  avatar: z.url().optional(),
  roles: z.array(z.string()),
});

export const UserFilterSchema = createFilterSchema(UserDocumentSchema);
