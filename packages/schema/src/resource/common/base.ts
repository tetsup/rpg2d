import z from 'zod';
import type { ResourcePath, ResourceType } from '@sharedTypes/resource/common';

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

const namespacePattern = '[a-z][a-z0-9]*([.-][a-z][a-z0-9]*)*';

const resourceNamePattern = '[a-z][a-z0-9]*([.-][a-z][a-z0-9]*)*';

const resourceTypePattern = resources.join('|');

export const NamespaceSchema = z.string().regex(new RegExp(`^${namespacePattern}$`));

export const ResourceNameSchema = z.string().regex(new RegExp(`^${resourceNamePattern}$`));

export const ResourceTypeSchema = z.enum(resources);

export const IdSchemaFromTypePattern = (typePattern: string) =>
  z
    .string()
    .regex(
      new RegExp(`^${namespacePattern}/(${typePattern})/${resourceNamePattern}$`),
      "idは 'namespace/type/name' 形式で、小英文字、数字、ハイフンと単一ドットのみ使用できます"
    );

export const IdSchemaFromType = (type: ResourceType) => IdSchemaFromTypePattern(type);

export const IdSchema = IdSchemaFromTypePattern(resourceTypePattern);

export const splitId = IdSchema.transform((id) => {
  const [namespace, type, name] = id.split('/');
  return { namespace, type, name } as ResourcePath;
});
