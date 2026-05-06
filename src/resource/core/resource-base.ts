import { ResourceData, ResourceDeps, ResourceName } from '@/types/resource';
import { GameContext } from './game-context';

export abstract class ResourceBase<K extends ResourceName> {
  constructor(
    protected ctx: GameContext,
    protected data: ResourceData<K>,
    protected deps: ResourceDeps<K>
  ) {}
  static loadDeps = async (ctx: GameContext, data: any): Promise<any> => ({});
}
