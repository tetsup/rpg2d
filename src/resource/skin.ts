import { SkinData, SkinSchema } from '@/schemas/image/skin';
import { ResourceManager } from './resource-manager';
import { ResourceBase } from './resource-base';

export class Skin extends ResourceBase<'skin'> {
  static schema = SkinSchema;
}
