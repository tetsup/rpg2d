import z from 'zod';
import type { ResourceSearchReqParamsSchema } from '@schema/api/resource/search';

export type ResourceSearchReqParams = z.infer<typeof ResourceSearchReqParamsSchema>;
