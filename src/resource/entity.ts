import { EntityData, EntitySchema } from '@/schemas/entity';
import type { ResourceManager } from './resource-manager';
import { ResourceBase } from './resource-base';
import { Appearance } from './appearance';

export class Entity extends ResourceBase<'entity'> {
  static schema = EntitySchema;

  static async loadDeps(resources: ResourceManager, data: EntityData) {
    const appearance = await Appearance.factory(resources, data.appearance);
    return { appearance };
  }
}
