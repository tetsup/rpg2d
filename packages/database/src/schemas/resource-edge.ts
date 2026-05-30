import { IdSchema } from '@schema/resource/common/base';
import { z } from 'zod';

export const ResourceEdgeDocumentSchema = z.object({
  from: IdSchema,
  to: IdSchema,
  type: z.literal('reference'),
});
