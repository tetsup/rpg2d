import type { ActionDeps } from '@engine/types/resource-deps';
import { ResourceBase } from '../core/resource-base';

export class Action extends ResourceBase<'action'> {
  static async loadDeps(): Promise<ActionDeps> {
    return {};
  }

  getSequence = () => this.data.sequence;
}
