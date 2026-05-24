import z from 'zod';
import type { ResourceType } from '@sharedTypes/resource/common';

export const resources = [
  'action',
  'entity',
  'field',
  'font',
  'image',
  'manifest',
  'panel',
  'panel-skin',
  'player',
  'skin',
  'texture',
  'tile',
] as const;

export const IdSchema = z
  .string()
  .regex(
    /^[a-z][a-z0-9]*\/[a-z-]+\/[a-z][a-z0-9]*([.-][a-z][a-z0-9]*)*$/,
    "idは 'namespace/type/name' 形式で、小英文字、数字、ハイフンと単一ドットのみ使用できます"
  );

export const ResourceSchema = <T extends ResourceType>(resourceType: T) =>
  z
    .object({
      id: IdSchema,
      type: z.literal(resourceType),
    })
    .refine((v) => v.type === v.id.split('/')[1]);

export const ResourceSchemaBase = <T extends z.ZodRawShape>(resourceType: ResourceType, data: T) =>
  z.object({ ...ResourceSchema(resourceType).shape, ...data }).strict();
