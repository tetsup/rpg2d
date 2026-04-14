import type { ResourceManager } from './resource-manager';
import { EntityData, EntitySchema } from '@/schemas/entity';
import { Skin } from './skin';
import { ResourceBase } from './resource-base';
import { SkinSchema } from '@/schemas/image/skin';

export class Entity extends ResourceBase<'entity'> {
  static schema = EntitySchema;

  static async loadDeps(resources: ResourceManager, data: EntityData) {
    const skin = await resources.get(data.skin, SkinSchema, Skin.factory);
    return { skin };
  }
}
