import type z from 'zod';
import type { NamespacePostParamsSchema } from '@schema/api/namespace/post';

export type NamespacePostParams = z.infer<typeof NamespacePostParamsSchema>;
