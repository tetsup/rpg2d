import { z } from 'zod';
import type { ResourceType } from '@sharedTypes/resource/common';
import { IdSchema, IdSchemaFromType, NamespaceSchema, ResourceNameSchema } from '@schema/resource/common/base';
import { resolveResourceSchema } from '@schema/resource/common/resolver';

export const createResourceDocumentSchema = (type: ResourceType) =>
  z.object({
    id: IdSchemaFromType(type),
    namespace: NamespaceSchema,
    type: z.literal(type),
    name: ResourceNameSchema,
    refs: z.array(IdSchema),
    data: resolveResourceSchema(type),
  });
