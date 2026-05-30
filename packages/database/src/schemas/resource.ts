import { z } from 'zod';
import type { ResourceType } from '@sharedTypes/resource/common';
import { NamespaceSchema, ResourceNameSchema } from '@schema/resource/common/base';
import { resolveResourceSchema } from '@schema/resource/common/resolver';

export const createResourceDocumentSchema = (type: ResourceType) =>
  z.object({
    namespace: NamespaceSchema,
    type: z.literal(type),
    name: ResourceNameSchema,
    data: resolveResourceSchema(type),
  });
