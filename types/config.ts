import type z from 'zod';
import type { ResourceConfigSchema } from '@schema/config/resource-config';

export type ResourceConfig = z.infer<typeof ResourceConfigSchema>;
