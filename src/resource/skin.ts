import { SkinSchema } from '@/schemas/image/skin';
import { ResourceBase } from './resource-base';

export class Skin extends ResourceBase<'skin'> {
  static schema = SkinSchema;
}
