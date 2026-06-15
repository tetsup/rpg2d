import type { ResourceData, ResourceType } from '@sharedTypes/resource/common';
import type { ResourceDeps } from '@engine/types/resource-deps';
import type { GameContext } from './game-context';

export abstract class ResourceBase<K extends ResourceType> {
  constructor(
    protected ctx: GameContext,
    protected data: ResourceData<K>,
    protected deps: ResourceDeps<K>
  ) {}

  static loadDeps = async (ctx: GameContext, data: any): Promise<any> => {
    void ctx;
    void data;
    return {};
  };
}
