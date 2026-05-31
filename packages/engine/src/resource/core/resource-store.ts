import z from 'zod';
import type { ResourceId, ResourceType } from '@sharedTypes/resource/common';
import { resources } from '@schema/resource/common/base';
import { fetchJson, fetchWithThrow, FetchWithThrowParams } from '@engine/utils/http/fetch';
import type { ResourceClass } from '@engine/types/resource';
import type { GameContext } from './game-context';

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

  fetch = async <T>(id: ResourceId, schema: z.ZodType<T>): Promise<T> => {
    return await fetchJson(`${this.ctx.config.resourceUri}/${id}`, this.fetchFunc, schema);
  };

  private async resolve<K extends ResourceType>(id: ResourceId, type: K): Promise<InstanceType<ResourceClass<K>>> {
    const schema = this.ctx.schemas.get(type);
    const data = await this.fetch(id, schema);
    return await this.ctx.factory.create(data, type);
  }

  get = async <K extends ResourceType>(id: ResourceId, type: K): Promise<InstanceType<ResourceClass<K>>> => {
    const resource = this.resources[type].get(id);
    if (resource !== undefined) return resource;
    const createdResource = await this.resolve(id, type);
    this.resources[type].set(id, createdResource);
    return createdResource;
  };
}
