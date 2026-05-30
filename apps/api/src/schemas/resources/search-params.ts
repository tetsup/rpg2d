import z from 'zod';
import { resources } from '@schema/resource/common/base';

export const ResourceSearchReqParamsSchema = z.object({
  q: z.string().default(''),
  namespace: z.string().optional(),
  type: z.enum(resources).optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(40),
});
