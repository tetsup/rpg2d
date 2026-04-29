import type { ResourceId } from '@/schemas/common';
import { resources, type ResourceClass, type ResourceName } from '@/types/resource';
import type { GameContext } from './game-context';
import { fetchJson } from '@/utils/http/fetch';
import z from 'zod';

type Resources = {
  [K in ResourceName]: Map<ResourceId, InstanceType<ResourceClass<K>>>;
};

export class ResourceStore {
  private resources: Resources;
  constructor(private ctx: GameContext) {
    this.resources = Object.fromEntries(resources.map((name) => [name, new Map()])) as Resources;
  }

  fetch = async <T>(id: ResourceId, schema: z.ZodType<T>): Promise<T> => {
    return await fetchJson(`${this.ctx.config.resourceUri}/${id}`, schema);
  };

  private async resolve<K extends ResourceName>(id: ResourceId, type: K): Promise<InstanceType<ResourceClass<K>>> {
    const schema = this.ctx.schemas.get(type);
    const data = await this.fetch(id, schema);
    return await this.ctx.factory.create(data, type);
  }

  get = async <K extends ResourceName>(id: ResourceId, type: K): Promise<InstanceType<ResourceClass<K>>> => {
    const resource = this.resources[type].get(id);
    if (resource !== undefined) return resource;
    const createdResource = await this.resolve(id, type);
    this.resources[type].set(id, createdResource);
    return createdResource;
  };
}
