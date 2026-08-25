import z from 'zod';
import type { ExecutableResourceType, ResourceId } from '@sharedTypes/resource/common';
import { NamespaceSchema, parseResourceId, ResourceNameSchema, resources } from '@schema/resource/common/base';
import { ResourceRecordResponseSchema } from '@schema/api/resource/record';
import { fetchJson, fetchWithThrow, FetchWithThrowParams } from '@engine/utils/http/fetch';
import type { ResourceClass } from '@engine/types/resource';
import type { GameContextLike } from './game-context';
import { ResourceInstanceMap, ResourceInstanceMapLike } from './resource-factory';

type Resources = {
  [K in ExecutableResourceType]: Map<ResourceId, InstanceType<ResourceClass<K>>>;
};

export interface ResourceStoreLike<M extends ResourceInstanceMapLike<any>> {
  get<K extends keyof M>(id: ResourceId, expectedType: K): Promise<M[K]>;
}

export class ResourceStore implements ResourceStoreLike<ResourceInstanceMap> {
  private resources: Resources;
  constructor(
    private ctx: GameContextLike,
    private fetchFunc: <T>(params: FetchWithThrowParams<T>) => Promise<T> = fetchWithThrow
  ) {
    this.resources = Object.fromEntries(resources.map((name) => [name, new Map()])) as Resources;
  }

  private fetch = async <T>(namespace: string, type: string, name: string, schema: z.ZodType<T>): Promise<T> => {
    return await fetchJson(`${this.ctx.config.resourceUri}/${namespace}/${type}/${name}`, this.fetchFunc, schema, {
      credentials: 'include',
    });
  };

  private async resolve<K extends ExecutableResourceType>(namespace: string, type: K, name: string) {
    const schema = this.ctx.schemas.get(type);
    const body = await this.fetch(namespace, type, name, z.unknown());
    const record = ResourceRecordResponseSchema.extend({
      namespace: NamespaceSchema.refine((v) => v === namespace),
      type: z.literal(type),
      name: ResourceNameSchema.refine((v) => v === name),
    }).parse(body);
    const payload = schema.parse(record.data);
    return await this.ctx.factory.create(record.id, payload, type);
  }

  get = async <K extends ExecutableResourceType>(id: ResourceId, expectedType: K): Promise<ResourceInstanceMap[K]> => {
    const { namespace, type, name } = parseResourceId.parse(id);
    if (type !== expectedType) throw new Error('mismatch id and type');
    const resource = this.resources[expectedType].get(id);
    if (resource !== undefined) return resource as ResourceInstanceMap[K];
    const createdResource = (await this.resolve(namespace, type, name)) as ResourceInstanceMap[K];
    this.resources[expectedType].set(id, createdResource);
    return createdResource;
  };
}
