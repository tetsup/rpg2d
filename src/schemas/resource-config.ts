import z from 'zod';

export const ResourceConfigSchema = z.object({ resourceUri: z.httpUrl() });

export type ResourceConfig = z.infer<typeof ResourceConfigSchema>;
