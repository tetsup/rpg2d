import z from 'zod';
import type { ManifestData } from '@sharedTypes/resource/manifest';
import { ResourceRecordResponseSchema } from '@schema/api/resource/record';
import { NamespaceSchema, parseResourceId, ResourceNameSchema } from '@schema/resource/common/base';
import { ManifestSchema } from '@schema/resource/manifest';

export async function loadManifest(manifestId: string, resourceUri: string): Promise<ManifestData> {
  const response = await fetch(`${resourceUri}/${manifestId}`, { credentials: 'include' });
  if (!response.ok) {
    throw new Error(`Failed to load manifest: ${manifestId}`);
  }
  const path = parseResourceId.parse(manifestId);
  const body = await response.json();
  const record = ResourceRecordResponseSchema.extend({
    namespace: NamespaceSchema.refine((v) => v === path.namespace),
    type: z.literal('manifest'),
    name: ResourceNameSchema.refine((v) => v === path.name),
  }).parse(body);
  return ManifestSchema.parse(record.data);
}
