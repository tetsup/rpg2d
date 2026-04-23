import { ActionDeps } from '@/schemas/action';
import { ResourceBase } from '../core/resource-base';

export class Action extends ResourceBase<'action'> {
  static async loadDeps(): Promise<ActionDeps> {
    return {};
  }
}
