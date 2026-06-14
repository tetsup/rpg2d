import { z } from 'zod';
import { NamespaceSchema } from '@schema/resource/common/base';
import { SingleLineSchema } from '@schema/common/string';

export const NamespaceInputSchema = z.object({
  id: NamespaceSchema,
  displayName: SingleLineSchema.min(1).max(30),
  description: z.string().max(200),
  isPrivate: z.boolean(),
});
