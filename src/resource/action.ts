import { ActionSchema } from '@/schemas/action';
import { ResourceBase } from './resource-base';

export class Action extends ResourceBase<'action'> {
  static schema = ActionSchema;
}
