import z from 'zod';
import type { ResourceRecord } from '@sharedTypes/database/collection';
import type { ResourceSearchReqParamsSchema } from '@schema/api/resource/search';

export type ResourceSearchReqParams = z.infer<typeof ResourceSearchReqParamsSchema>;

export type ResourceGetResponse = ResourceRecord;
