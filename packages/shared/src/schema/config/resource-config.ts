import z from 'zod';

export const ResourceConfigSchema = z.object({ resourceUri: z.string() });
