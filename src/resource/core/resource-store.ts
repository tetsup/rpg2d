import type { ResourceId } from '@/schemas/common';
import type { ResourceClass, ResourceName } from '@/types/resource';
import type { GameContext } from './game-context';

export class ResourceStore {
  private resources: Map<ResourceId, InstanceType<ResourceClass<any>>> = new Map();
  constructor(private ctx: GameContext) {}

  async fetch(id: ResourceId): Promise<unknown> {
    const res = await fetch(`${process.env.RESOURCE_URI}/${id}`);
    return await res.json();
  }

  private async resolve<K extends ResourceName>(id: ResourceId, type: K) {
    const data = await this.fetch(id);
    const parsed = this.ctx.schemas.get(type).parse(data);
    return await this.ctx.factory.create(parsed, type);
  }

  async get<K extends ResourceName>(id: ResourceId, type: K) {
    const resource = this.resources.get(id);
    if (resource !== undefined) return resource;
    const createdResource = await this.resolve(id, type);
    this.resources.set(id, createdResource);
    return createdResource;
  }
}
