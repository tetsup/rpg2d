import z from 'zod';

export const ResourceConfigSchema = z.object({ resourceUri: z.string(), imageUri: z.string() });

export type ResourceConfig = z.infer<typeof ResourceConfigSchema>;
