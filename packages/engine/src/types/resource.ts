import z from 'zod';
import type { ExecutableResourceType, ResourceData } from '@sharedTypes/resource/common';
import type { GameContextLike } from '@engine/resource/core/game-context';
import type { SchemaRegistry } from '@engine/resource/core/schema-registry';
import type { ResourceClassMap } from '@engine/resource/core/resource-factory';
import type { ResourceDeps } from './resource-deps';

export type ResourceClass<K extends keyof typeof ResourceClassMap> = (typeof ResourceClassMap)[K];

export type ResourceConstructor<K extends ExecutableResourceType> = new (
  ctx: GameContextLike,
  data: ResourceData<K>,
  deps: ResourceDeps<K>
) => InstanceType<ResourceClass<K>>;

export type ResourceStatic<K extends ExecutableResourceType> = {
  getSchema: (schemas: SchemaRegistry) => z.ZodType<ResourceData<K>>;
  loadDeps: (ctx: GameContextLike, data: ResourceData<K>) => Promise<ResourceDeps<K>>;
} & ResourceConstructor<K>;
