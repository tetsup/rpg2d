import z from 'zod';
import type { ResourceId, ResourceType } from '@sharedTypes/resource/common';
import { NamespaceSchema, ResourceNameSchema, resources } from '@schema/resource/common/base';
import { fetchJson } from '@engine/utils/http/fetch';
import type { ResourceClass } from '@engine/types/resource';
import type { GameContext } from './game-context';

type Resources = {
  [K in ResourceType]: Map<ResourceId, InstanceType<ResourceClass<K>>>;
};

const createFetchedResourceSchema = <K extends ResourceType, T>(type: K, dataSchema: z.ZodType<T>) =>
  z.object({
    namespace: NamespaceSchema,
    type: z.literal(type),
    name: ResourceNameSchema,
    data: dataSchema,
  });

export class ResourceStore {
  private resources: Resources;
  constructor(private ctx: GameContext) {
    this.resources = Object.fromEntries(resources.map((name) => [name, new Map()])) as Resources;
  }

  fetch = async <T>(id: ResourceId, schema: z.ZodType<T>): Promise<T> => {
    return await fetchJson(`${this.ctx.config.resourceUri}/${id}`, schema);
  };

  private async resolve<K extends ResourceType>(id: ResourceId, type: K): Promise<InstanceType<ResourceClass<K>>> {
    const dataSchema = this.ctx.schemas.get(type);
    const resource = await this.fetch(id, createFetchedResourceSchema(type, dataSchema));
    return await this.ctx.factory.create(resource.data, type);
  }

  get = async <K extends ResourceType>(id: ResourceId, type: K): Promise<InstanceType<ResourceClass<K>>> => {
    const resource = this.resources[type].get(id);
    if (resource !== undefined) return resource;
    const createdResource = await this.resolve(id, type);
    this.resources[type].set(id, createdResource);
    return createdResource;
  };
}
