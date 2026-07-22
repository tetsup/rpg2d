import z from 'zod';

export const UserInputSchema = z.object({
  id: z.string().nonempty(),
  presenceName: z.string().nonempty(),
  email: z.email().optional(),
  avatar: z.url().optional(),
  isAdmin: z.boolean(),
});
