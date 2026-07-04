import z from 'zod';
import type { ExecutableResourceType, ResourceId } from '@sharedTypes/resource/common';
import { NamespaceSchema, parseResourceId, ResourceNameSchema, resources } from '@schema/resource/common/base';
import { fetchJson, fetchWithThrow, FetchWithThrowParams } from '@engine/utils/http/fetch';
import type { ResourceClass } from '@engine/types/resource';
import type { GameContext } from './game-context';

type Resources = {
  [K in ExecutableResourceType]: Map<ResourceId, InstanceType<ResourceClass<K>>>;
};

export class ResourceStore {
  private resources: Resources;
  constructor(
    private ctx: GameContext,
    private fetchFunc: <T>(params: FetchWithThrowParams<T>) => Promise<T> = fetchWithThrow
  ) {
    this.resources = Object.fromEntries(resources.map((name) => [name, new Map()])) as Resources;
  }

  fetch = async <T>(namespace: string, type: string, name: string, schema: z.ZodType<T>): Promise<T> => {
    return await fetchJson(
      `${this.ctx.config.resourceUri}/${namespace}/${type}/${name}`,
      this.fetchFunc,
      schema,
      { credentials: 'include' }
    );
  };

  private async resolve<K extends ExecutableResourceType>(
    namespace: string,
    type: K,
    name: string
  ): Promise<InstanceType<ResourceClass<K>>> {
    const schema = this.ctx.schemas.get(type);
    const body = await this.fetch(namespace, type, name, z.unknown());
    const payload =
      body != null && typeof body === 'object' && 'data' in body
        ? z
            .object({
              namespace: NamespaceSchema.refine((v) => v === namespace),
              type: z.literal(type),
              name: ResourceNameSchema.refine((v) => v === name),
              version: z.literal(0),
              data: schema,
            })
            .parse(body).data
        : schema.parse(body);
    return await this.ctx.factory.create(payload, type);
  }

  get = async <K extends ExecutableResourceType>(
    id: ResourceId,
    expectedType: K
  ): Promise<InstanceType<ResourceClass<K>>> => {
    const { namespace, type, name } = parseResourceId.parse(id);
    if (type !== expectedType) throw new Error('mismatch id and type');
    const resource = this.resources[expectedType].get(id);
    if (resource !== undefined) return resource;
    const createdResource = await this.resolve(namespace, type, name);
    this.resources[expectedType].set(id, createdResource);
    return createdResource;
  };
}
