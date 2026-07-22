import type z from 'zod';
import type { InitialFieldStateSchema, ManifestSchema, MessageConfigSchema } from '@schema/resource/manifest';

export type InitialFieldState = z.infer<typeof InitialFieldStateSchema>;
export type MessageConfig = z.infer<typeof MessageConfigSchema>;
export type ManifestData = z.infer<typeof ManifestSchema>;
