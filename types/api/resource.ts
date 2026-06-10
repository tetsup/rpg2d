import z from 'zod';
import type { ResourceSearchReqParamsSchema } from '@api/schemas/resources/search-params';

export type ResourceSearchReqParams = z.infer<typeof ResourceSearchReqParamsSchema>;
