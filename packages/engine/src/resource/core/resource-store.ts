import z from 'zod';
import type { ResourceId, ResourceType } from '@sharedTypes/resource/common';
import { NamespaceSchema, ResourceNameSchema, resources, splitId } from '@schema/resource/common/base';
import { fetchJson, fetchWithThrow, FetchWithThrowParams } from '@engine/utils/http/fetch';
import type { ResourceClass } from '@engine/types/resource';
import type { GameContext } from './game-context';
import { version } from 'zod/v4/core';

type Resources = {
  [K in ResourceType]: Map<ResourceId, InstanceType<ResourceClass<K>>>;
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
    return await fetchJson(`${this.ctx.config.resourceUri}/${namespace}/${type}/${name}`, this.fetchFunc, schema);
  };

  private async resolve<K extends ResourceType>(
    namespace: string,
    type: K,
    name: string
  ): Promise<InstanceType<ResourceClass<K>>> {
    const schema = this.ctx.schemas.get(type);
    const responseSchema = z.object({
      namespace: NamespaceSchema.refine((v) => v === namespace),
      type: z.literal(type),
      name: ResourceNameSchema.refine((v) => v === name),
      version: z.literal(0),
      data: schema,
    });
    const resource = await this.fetch(namespace, type, name, responseSchema);
    return await this.ctx.factory.create(resource.data, type);
  }

  get = async <K extends ResourceType>(id: ResourceId, expectedType: K): Promise<InstanceType<ResourceClass<K>>> => {
    const { namespace, type, name } = splitId.parse(id);
    if (type !== expectedType) throw new Error('mismatch id and type');
    const resource = this.resources[expectedType].get(id);
    if (resource !== undefined) return resource;
    const createdResource = await this.resolve(namespace, type, name);
    this.resources[expectedType].set(id, createdResource);
    return createdResource;
  };
}
