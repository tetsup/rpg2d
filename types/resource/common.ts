import type z from 'zod';
import type { IdSchema, resources } from '@schema/resource/common/base';
import type { PositionSchema } from '@schema/resource/common/coordinate';
import type { PrimitiveValueSchema } from '@schema/resource/variable/condition';
import { ResourceSchemaMap } from '@schema/resource/common/resolver';

export type ResourceType = (typeof resources)[number];
export type ExecutableResourceType = Exclude<ResourceType, 'manifest'>;
export type ResourceId = z.infer<typeof IdSchema>;
export type PrimitiveValue = z.infer<typeof PrimitiveValueSchema>;
export type Position = z.infer<typeof PositionSchema>;
export type ResourcePath = {
  namespace: string;
  type: ResourceType;
  name: string;
};
export type ResourceData<T extends ResourceType> = z.infer<(typeof ResourceSchemaMap)[T]>;
