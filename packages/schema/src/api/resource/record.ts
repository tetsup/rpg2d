import z from 'zod';
import { IdSchema, NamespaceSchema, ResourceNameSchema } from '@schema/resource/common/base';

export const ResourceRecordResponseSchema = z.object({
  id: IdSchema,
  namespace: NamespaceSchema,
  type: z.string(),
  name: ResourceNameSchema,
  version: z.literal(0),
  description: z.string().max(100).optional(),
  isDraft: z.boolean(),
  data: z.unknown(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  createdBy: z.string(),
});
