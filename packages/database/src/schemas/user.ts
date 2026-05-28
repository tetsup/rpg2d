import { z } from 'zod';

export const UserDocumentSchema = z.object({
  sub: z.string().nonempty(),
  presenceName: z.string().nonempty(),
  email: z.email().optional(),
  avatar: z.url().optional(),
  roles: z.array(z.string()),
});
