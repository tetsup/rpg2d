import z from 'zod';
import type { ResourceType } from '@sharedTypes/resource/common';
import { NamespaceSchema, ResourceNameSchema } from '@schema/resource/common/base';
import { resolveResourceSchema } from '@schema/resource/common/resolver';

export const createResourceMetaInputSchema = <T extends ResourceType>(type: T, isValid: boolean) =>
  z.object({
    namespace: NamespaceSchema,
    type: z.literal(type),
    name: ResourceNameSchema,
    version: z.literal(0),
    description: z.string().max(100).optional(),
    isValid: z.literal(isValid),
  });

export const createValidResourceInputSchema = (type: ResourceType) =>
  createResourceMetaInputSchema(type, true).extend({ data: resolveResourceSchema(type) });

export const createInvalidResourceInputSchema = (type: ResourceType) =>
  createResourceMetaInputSchema(type, false).extend({ data: z.object() });

export const createResourceInputSchema = (type: ResourceType) =>
  z.union([createValidResourceInputSchema(type), createInvalidResourceInputSchema(type)]);
