import { resources } from '@schema/resource/common/base';
import z from 'zod';

export const ResourceGetReqSchema = z.object({
  namespace: z.string().regex(/^[a-z][a-z0-9]*$/),
  type: z.enum(resources),
  id: z.string().regex(/^[a-z0-9][a-z0-9]*$/),
});
