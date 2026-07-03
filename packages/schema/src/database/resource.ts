import z from 'zod';
import type { ResourceType } from '@sharedTypes/resource/common';
import { ResourcePathSchema } from '@schema/resource/common/base';
import { resolveResourceSchema } from '@schema/resource/common/resolver';
import { deepNullable } from '@schema/utils/deep-nullable';

export const createResourceMetaInputSchema = <T extends ResourceType>(type: T, isDraft: boolean) =>
  ResourcePathSchema.extend({
    type: z.literal(type),
  }).extend({
    version: z.literal(0),
    description: z.string().max(100).optional(),
    isDraft: z.literal(isDraft),
  });

function resolveDraftResourceDataSchema(type: ResourceType) {
  const strict = resolveResourceSchema(type);
  if (type === 'image') return strict;
  return deepNullable(strict);
}

export const createDraftResourceInputSchema = (type: ResourceType) =>
  createResourceMetaInputSchema(type, true).extend({
    data: resolveDraftResourceDataSchema(type),
  });

export const createReadyResourceInputSchema = (type: ResourceType) =>
  createResourceMetaInputSchema(type, false).extend({
    data: resolveResourceSchema(type),
  });

export const createResourceInputSchema = (type: ResourceType) =>
  z.discriminatedUnion('isDraft', [
    createDraftResourceInputSchema(type),
    createReadyResourceInputSchema(type),
  ]);
