import { z } from 'zod';
import type { ResourceType } from '@sharedTypes/resource/common';
import { NamespaceSchema, ResourceNameSchema } from '@schema/resource/common/base';
import { resolveResourceSchema } from '@schema/resource/common/resolver';

export const createResourceMetaSchema = (type: ResourceType, isValid: boolean) =>
  z.object({
    namespace: NamespaceSchema,
    type: z.literal(type),
    name: ResourceNameSchema,
    version: z.literal(0),
    description: z.string().max(100).optional(),
    isReadOnly: z.boolean(),
    isValid: z.literal(isValid),
  });
export const createResourceDocumentSchema = (type: ResourceType) =>
  createResourceMetaSchema(type, true)
    .extend({ data: resolveResourceSchema(type) })
    .or(createResourceMetaSchema(type, false).extend({ data: z.record(z.string(), z.any()) }));
